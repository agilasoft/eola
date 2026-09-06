import unittest
from unittest.mock import MagicMock, patch

import frappe

from eola import inventory
from eola.quotation import equipment_from_plan
from eola.solar_sizing import estimate
from eola.eola.doctype.es_stock_entry.es_stock_entry import ESStockEntry


class TestInventory(unittest.TestCase):
    def test_stock_and_price_selection(self):
        data = dict(monthly_bill=6000, allocated_budget=400000, electricity_rate=12,
                    desired_reduction=50, roof_shading='None', grid_connection='Connected')
        catalog = [dict(item=name, equipment_type='PV Module', rated_power=550,
                        available_stock=qty, rate=2300) for name, qty in
                   [('EMPTY', 0), ('SHORT', 6), ('AVAILABLE', 7)]]
        plan = estimate(data, catalog)
        row = equipment_from_plan(plan)[0]
        self.assertEqual(row['item'], 'AVAILABLE')
        self.assertEqual(row['rate'], 2300)
        self.assertEqual(row['quantity'], 7)
        self.assertEqual([c['item'] for c in plan['equipment'][0]['catalog_candidates']], ['AVAILABLE'])
        self.assertEqual(equipment_from_plan(estimate(data, catalog[:2])), [])

    def test_catalog_uses_balances_and_enabled_prices(self):
        backend = MagicMock()
        backend.get_all.side_effect = [[frappe._dict(name='A', item_name='Catalog Panel', description='Actual description', manufacturer='Brand', model='Model')], [frappe._dict(item='A', rate=99)]]
        with patch.object(inventory, 'frappe', backend), patch.object(inventory, 'stock_balances', return_value={'A': 5, 'B': 0}):
            rows = inventory.available_catalog([dict(item='A'), dict(item='B'), dict(item='C')])
        self.assertEqual(rows, [dict(item='A', available_stock=5, rate=99, item_name='Catalog Panel', description='Actual description', manufacturer='Brand', model='Model')])

    def test_issue_and_receipt_cancellation_cannot_make_stock_negative(self):
        from eola.eola.doctype.es_stock_entry import es_stock_entry as module
        backend = MagicMock()
        backend.throw.side_effect = ValueError
        for kind, cancel, balance, quantity, rejected in [
            ('Issue', False, 2, 3, True), ('Issue', False, 3, 3, False),
            ('Receipt', True, 2, 3, True), ('Receipt', True, 3, 3, False),
            ('Receipt', False, 0, 3, False), ('Issue', True, 0, 3, False)]:
            doc = frappe._dict(item='A', entry_type=kind, quantity=quantity)
            with patch.object(module, 'frappe', backend), patch.object(module, 'stock_balances', return_value={'A': balance}):
                if rejected:
                    with self.assertRaises(ValueError):
                        ESStockEntry.check_balance(doc, cancel)
                else:
                    ESStockEntry.check_balance(doc, cancel)

    def test_missing_rates_use_item_price_and_preserve_manual_rates(self):
        rows = [frappe._dict(item='A', rate=0), frappe._dict(item='A', rate=77),
                frappe._dict(item='B', rate=None), frappe._dict(item='C', rate=0)]
        backend = MagicMock()
        backend.get_all.return_value = [frappe._dict(item='A', rate=99), frappe._dict(item='B', rate=45)]
        with patch.object(inventory, 'frappe', backend):
            inventory.fill_missing_rates(rows)
        self.assertEqual([r.rate for r in rows], [99, 77, 45, 0])
