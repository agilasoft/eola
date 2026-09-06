import math
import frappe
from frappe.model.document import Document


class InstalledSolarSystem(Document):
    def validate(self):
        for field in ('temperature_alert_limit', 'ac_voltage_min', 'ac_voltage_max'):
            value = float(self.get(field) or 0)
            if not math.isfinite(value) or value < 0:
                frappe.throw('Alert limits must be finite, nonnegative numbers.')
        if self.get('ac_voltage_min') and self.get('ac_voltage_max') and self.ac_voltage_min >= self.ac_voltage_max:
            frappe.throw('Minimum AC voltage must be below maximum AC voltage.')
