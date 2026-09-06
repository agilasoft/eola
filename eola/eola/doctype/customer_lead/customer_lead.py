import math
import re

import frappe
from frappe.model.document import Document


class CustomerLead(Document):
    def onload(self):
        from eola.quotation import populate_equipment
        populate_equipment(self)
        from eola.inventory import fill_missing_rates
        fill_missing_rates(self.get("recommended_equipment") or [])
        from eola.quotation import calculate_amounts
        calculate_amounts(self.get("recommended_equipment") or [])

    def validate(self):
        from eola.quotation import calculate_amounts, populate_equipment, validate_catalog_rows
        populate_equipment(self)
        from eola.inventory import fill_missing_rates
        fill_missing_rates(self.get("recommended_equipment") or [])
        validate_catalog_rows(self.get('recommended_equipment') or [])
        calculate_amounts(self.get("recommended_equipment") or [])
        for field in ('first_name', 'last_name', 'phone', 'email', 'country', 'property_type'):
            value = self.get(field)
            if not isinstance(value, str) or not value.strip():
                frappe.throw(f'{field.replace("_", " ").title()} is required.')
            self.set(field, value.strip())
        if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', self.email):
            frappe.throw('Enter a valid email address.')
        if not re.fullmatch(r'\+?[0-9 ()-]{7,25}', self.phone) or not 7 <= len(re.sub(r'\D', '', self.phone)) <= 15:
            frappe.throw('Enter a valid phone number including country code.')
        for field, low, high in [('monthly_bill', .01, 100000000), ('allocated_budget', .01, 1000000000), ('electricity_rate', .01, 1000), ('desired_reduction', .01, 100), ('roof_age', 0, 200), ('roof_area', 0, 1000000)]:
            try:
                value = float(self.get(field) or 0)
            except (TypeError, ValueError):
                frappe.throw(f'Enter a valid {field.replace("_", " ")}.')
            if not math.isfinite(value) or not low <= value <= high:
                frappe.throw(f'{field.replace("_", " ").title()} must be between {low} and {high}.')
        if not self.processing_consent:
            frappe.throw('Consent to store and process the inquiry is required.')
        if self.is_new():
            self.consent_timestamp = frappe.utils.now_datetime()
            self.consent_version = 'eola-inquiry-v1'
        else:
            from eola.customer_inquiry import INPUT_FIELDS

            before = self.get_doc_before_save()
            if before and any(before.get(key) != self.get(key) for key in INPUT_FIELDS):
                self.recommendation_status = 'Pending'
                self.recommendation_json = None
                self.system_type = None
                self.equipment_initialized = 0
                self.set("recommended_equipment", [])
                self.ai_response = None
                self.ai_model = None
