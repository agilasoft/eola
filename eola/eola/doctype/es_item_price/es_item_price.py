import math

import frappe
from frappe.model.document import Document


class ESItemPrice(Document):
    def validate(self):
        if not math.isfinite(float(self.rate or 0)) or float(self.rate or 0) < 0:
            frappe.throw('Selling price must be zero or greater.')
