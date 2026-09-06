import unittest
from unittest.mock import MagicMock, patch
from eola.eola.doctype.es_quotation import es_quotation as module


class TestCustomerConversion(unittest.TestCase):
    def test_draft_does_not_create_customer(self):
        doc = MagicMock(status='Draft')
        with patch.object(module, 'frappe') as backend:
            module.ESQuotation.on_update(doc)
        backend.get_doc.assert_not_called()

    def test_acceptance_creates_customer_and_repeated_save_reuses_it(self):
        doc = MagicMock(status='Accepted', customer_lead='LEAD', first_name='Demo', last_name='Name',
                        property_type='Residential', accepted_on=None)
        doc.name = 'QUOTE'
        backend = MagicMock()
        backend.db.get_value.return_value = None
        backend.get_doc.return_value.insert.return_value.name = 'CUSTOMER'
        with patch.object(module, 'frappe', backend):
            module.ESQuotation.on_update(doc)
            doc.db_set.assert_any_call('customer', 'CUSTOMER')
            backend.get_doc.assert_called_once()
            backend.get_doc.reset_mock()
            backend.db.get_value.return_value = 'CUSTOMER'
            module.ESQuotation.on_update(doc)
            backend.get_doc.assert_not_called()
