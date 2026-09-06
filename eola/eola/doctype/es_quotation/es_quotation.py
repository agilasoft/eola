import frappe
from frappe.model.document import Document
from frappe.utils import getdate

from eola.quotation import calculate_amounts, validate_catalog_rows


class ESQuotation(Document):
    def validate(self):
        if self.valid_till and getdate(self.valid_till) < getdate(self.quotation_date):
            frappe.throw('Valid until cannot be earlier than the quotation date.')
        validate_catalog_rows(self.items)
        self.total = calculate_amounts(self.items)

    def on_update(self):
        if self.status != 'Accepted':
            return
        # Row lock and unique source links prevent duplicate conversion on retries.
        frappe.db.get_value('ES Quotation', self.name, 'name', for_update=True)
        if self.customer_lead:
            frappe.db.get_value('Customer Lead', self.customer_lead, 'name', for_update=True)
        customer = (frappe.db.get_value('ES Customer', {'customer_lead': self.customer_lead}, 'name')
                    if self.customer_lead else None)
        customer = customer or frappe.db.get_value('ES Customer', {'source_quotation': self.name}, 'name')
        if not customer:
            customer = frappe.get_doc(dict(doctype='ES Customer',
                customer_name=f'{self.first_name} {self.last_name}'.strip(),
                customer_type='Individual' if self.property_type == 'Residential' else 'Company',
                email=self.email, phone=self.phone, address=self.full_address,
                customer_lead=self.customer_lead, source_quotation=self.name)).insert().name
        self.db_set('customer', customer)
        if not self.accepted_on:
            self.db_set('accepted_on', frappe.utils.today())
