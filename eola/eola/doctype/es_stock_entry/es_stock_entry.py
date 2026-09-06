import math

import frappe
from frappe.model.document import Document
from frappe.utils import getdate, today

from eola.inventory import stock_balances


class ESStockEntry(Document):
    def validate(self):
        if not math.isfinite(float(self.quantity or 0)) or float(self.quantity or 0) <= 0:
            frappe.throw('Stock quantity must be a positive number.')
        if getdate(self.posting_date) > getdate(today()):
            frappe.throw('Stock entries cannot be posted in the future.')

    def before_submit(self):
        self.check_balance(cancel=False)

    def before_cancel(self):
        self.check_balance(cancel=True)

    def check_balance(self, cancel):
        frappe.db.sql('SELECT name FROM `tabES Item` WHERE name = %s FOR UPDATE', self.item)
        delta = float(self.quantity) * (1 if self.entry_type == 'Receipt' else -1)
        if cancel:
            delta = -delta
        if stock_balances().get(self.item, 0) + delta < 0:
            frappe.throw('This movement would make item stock negative.')
