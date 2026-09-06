"""ERP-only inquiry submission and locally calculated solar estimates."""
import json
import re

import frappe

from eola.inventory import available_catalog
from eola.solar_sizing import estimate
from eola.quotation import equipment_from_plan

INPUT_FIELDS = ('first_name last_name phone email country full_address property_type ownership_status roof_type roof_shading roof_age roof_area monthly_bill electricity_provider allocated_budget desired_reduction electricity_rate reduce_costs environment independence property_value other_reason reason_details grid_connection backup_required installation_timeline comments marketing_consent processing_consent').split()


@frappe.whitelist(methods=['POST'])
def submit_inquiry(data, submission_id):
    if not frappe.has_permission('Customer Lead', 'create'):
        frappe.throw('You do not have permission to create customer leads.', frappe.PermissionError)
    if not isinstance(submission_id, str) or not re.fullmatch(r'[a-zA-Z0-9-]{20,64}', submission_id):
        frappe.throw('Invalid submission identifier. Reload the inquiry page.')
    data = frappe.parse_json(data)
    if not isinstance(data, dict):
        frappe.throw('Invalid inquiry data.')
    with frappe.cache.lock(f'eola-inquiry-{submission_id}', timeout=15):
        existing = frappe.db.get_value('Customer Lead', {'submission_id': submission_id}, 'name')
        if existing:
            doc = frappe.get_doc('Customer Lead', existing)
            doc.check_permission('read')
            return {'name': doc.name}
        values = {key: data[key] for key in INPUT_FIELDS if key in data}
        for value in values.values():
            if isinstance(value, (dict, list)) or (isinstance(value, str) and len(value) > 4000):
                frappe.throw('Inquiry fields must be simple values of at most 4,000 characters.')
        doc = frappe.get_doc(dict(doctype='Customer Lead', submission_id=submission_id, **values))
        doc.insert()
        return {'name': doc.name}


@frappe.whitelist(methods=['POST'])
def generate_inquiry_recommendation(name):
    doc = frappe.get_doc('Customer Lead', name)
    doc.check_permission('read')
    doc.check_permission('write')
    with frappe.cache.lock(f'eola-inquiry-recommendation-{name}', timeout=60, blocking_timeout=1):
        doc.reload()
        # get_list respects catalog read permissions; missing catalog access still allows generic sizing.
        catalog = []
        if frappe.has_permission('EOLA Equipment Specification', 'read'):
            catalog = frappe.get_list('EOLA Equipment Specification', filters={'active': 1}, fields=['item', 'specification_name', 'equipment_type', 'manufacturer', 'model', 'rated_power', 'rated_ac_output', 'nominal_capacity'], limit_page_length=500)
            enabled = set(frappe.get_all('ES Item', filters={'disabled': 0}, pluck='name'))
            catalog = available_catalog([c for c in catalog if c.item in enabled])
        plan = estimate(doc.as_dict(), catalog)
        doc.recommendation_json = json.dumps(plan)
        doc.set('recommended_equipment', equipment_from_plan(plan))
        doc.equipment_initialized = 1
        doc.system_type = plan['system_type']
        doc.ai_response = 'Your inquiry is saved in EOLA ERP. This preliminary solar estimate is calculated locally. Our team can review your requirements and confirm a proposal.'
        doc.ai_model = ''
        doc.recommendation_status = 'Estimate Only'
        doc.save()
        return result_for(doc)


def result_for(doc):
    return {'name': doc.name, 'status': doc.recommendation_status, 'explanation': doc.ai_response, 'plan': json.loads(doc.recommendation_json)}
