import json
import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import frappe
from eola import quotation as api


class DocumentStub(SimpleNamespace):
    def get(self, key):
        return getattr(self, key, None)

    def set(self, key, value):
        setattr(self, key, value)

    def append(self, key, value):
        getattr(self, key).append(frappe._dict(value))


class TestQuotation(unittest.TestCase):
    def test_legacy_snapshot_populates_first_candidate(self):
        lead = DocumentStub(recommendation_json=json.dumps({'equipment': [dict(type='PV Module', specification='550 W panel', quantity=8,
            catalog_candidates=[dict(item='PV-1', manufacturer='Brand', model='Model')])]}))
        api.populate_equipment(lead)
        self.assertEqual(lead.recommended_equipment[0]['quantity'], 8)
        self.assertEqual(lead.recommended_equipment[0]['item'], 'PV-1')
        self.assertIn('PV-1', lead.recommended_equipment[0]['notes'])
        lead.recommended_equipment = []
        api.populate_equipment(lead)
        self.assertEqual(lead.recommended_equipment, [])

    def test_repair_restores_missing_rows_and_system_type_without_overwriting_edits(self):
        lead = DocumentStub(equipment_initialized=1, recommended_equipment=[],
            recommendation_json=json.dumps({'system_type': 'Off-Grid', 'equipment': [dict(specification='Panel', quantity=2, selected_item=dict(item='PV-1'))]}))
        api.populate_equipment(lead, repair=True)
        self.assertEqual(lead.system_type, 'Off-Grid')
        self.assertEqual(len(lead.recommended_equipment), 1)
        lead.recommended_equipment[0]['quantity'] = 9
        api.populate_equipment(lead, repair=True)
        self.assertEqual(lead.recommended_equipment[0]['quantity'], 9)

    def test_quotation_copies_edited_equipment_into_independent_unsaved_document(self):
        row = frappe._dict(description='Edited panel', item='PV-2', quantity=10, rate=2500, notes='Custom choice')
        lead = DocumentStub(name='LEAD-1', first_name='Ana', recommendation_status='Estimate Only',
            recommended_equipment=[row], equipment_initialized=1, check_permission=MagicMock(),
            recommendation_json=json.dumps({'system_type': 'Hybrid'}))
        quote = DocumentStub(items=[])
        backend = MagicMock()
        backend.get_doc.return_value = lead
        backend.new_doc.return_value = quote
        backend.has_permission.return_value = True
        with patch.object(api, 'frappe', backend):
            result = api.create_quotation('LEAD-1')
        self.assertIs(result, quote)
        self.assertEqual(quote.customer_lead, 'LEAD-1')
        self.assertEqual(quote.first_name, 'Ana')
        self.assertEqual(quote.system_type, 'Hybrid')
        self.assertEqual(quote.total, 25000)
        quote.items[0].quantity = 2
        self.assertEqual(row.quantity, 10)
        lead.check_permission.assert_called_once_with('read')
        backend.has_permission.assert_called_once_with('ES Quotation', 'create')

    def test_denied_creation_and_stale_recommendations_are_rejected(self):
        lead = DocumentStub(check_permission=MagicMock(), recommendation_status='Pending')
        backend = MagicMock(PermissionError=PermissionError)
        backend.get_doc.return_value = lead
        backend.throw.side_effect = ValueError('blocked')
        for allowed in (False, True):
            backend.has_permission.return_value = allowed
            with patch.object(api, 'frappe', backend), self.assertRaises(ValueError):
                api.create_quotation('LEAD-1')
        backend.new_doc.assert_not_called()

    def test_amounts_recomputed_and_invalid_values_rejected(self):
        row = frappe._dict(quantity=3, rate=12.34, amount=999)
        self.assertEqual(api.calculate_amounts([row]), 37.02)
        self.assertEqual(row.amount, 37.02)
        for quantity, rate in [(0, 1), (-1, 1), (1, -1), (float('nan'), 1), (1, float('inf'))]:
            with patch.object(api.frappe, 'throw', side_effect=ValueError), self.assertRaises(ValueError):
                api.calculate_amounts([frappe._dict(quantity=quantity, rate=rate)])

    def test_existing_blank_links_are_repaired_without_overwriting_edits(self):
        equipment = dict(type='Battery', specification='Battery requirement', quantity=1,
                         catalog_candidates=[dict(item='BAT-1', model='Original')])
        row = frappe._dict(equipment_type='Battery', description='Battery requirement',
                           quantity=4, rate=123, model='Edited')
        lead = DocumentStub(equipment_initialized=1, recommended_equipment=[row],
                            recommendation_json=json.dumps({'equipment': [equipment]}))
        api.populate_equipment(lead)
        self.assertEqual(row.item, 'BAT-1')
        self.assertEqual((row.quantity, row.rate, row.model), (4, 123, 'Edited'))
        row.item = 'MANUAL'
        api.populate_equipment(lead)
        self.assertEqual(row.item, 'MANUAL')

    def test_explicit_unavailable_selection_does_not_fall_back_to_candidates(self):
        plan = {'equipment': [dict(selected_item=None, catalog_candidates=[dict(item='OUT')])]}
        self.assertEqual(api.equipment_from_plan(plan), [])

    def test_generic_or_missing_item_rows_cannot_reach_quotation(self):
        backend = MagicMock()
        backend.db.exists.return_value = False
        backend.throw.side_effect = ValueError
        with patch.object(api, 'frappe', backend):
            for row in [frappe._dict(description='Generic'), frappe._dict(item='DELETED')]:
                with self.assertRaises(ValueError):
                    api.validate_catalog_rows([row])
