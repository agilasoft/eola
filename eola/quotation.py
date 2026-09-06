"""Local equipment snapshots and editable quotations from customer leads."""
import json
import math

import frappe

EQUIPMENT_FIELDS = ('item', 'equipment_type', 'description', 'manufacturer', 'model', 'quantity', 'uom', 'rate', 'notes')
CONTACT_PROJECT_FIELDS = ('first_name last_name phone email country full_address property_type ownership_status roof_type roof_shading roof_age roof_area monthly_bill electricity_provider allocated_budget desired_reduction electricity_rate grid_connection backup_required installation_timeline comments').split()


def equipment_from_plan(plan):
    rows = []
    for equipment in plan.get('equipment', []):
        candidates = [' / '.join(str(c.get(k) or '') for k in ('item', 'manufacturer', 'model'))
                      for c in equipment.get('catalog_candidates', [])]
        selected = equipment.get('selected_item') or {}
        # Legacy snapshots stored the selection only as an ordered candidate list.
        # An explicit selected_item=None in newer plans means no stock is available.
        if 'selected_item' not in equipment:
            selected = next((c for c in equipment.get('catalog_candidates', []) if c.get('item')), {})
        if not selected.get('item'):
            continue
        rows.append(dict(**({'item': selected['item']} if selected.get('item') else {}),
                         manufacturer=selected.get('manufacturer'), model=selected.get('model'), equipment_type=equipment.get('type'), description=selected.get('description') or equipment.get('specification'),
                         quantity=equipment.get('quantity'), uom='Nos', rate=selected.get('rate', 0),
                         notes='\n'.join(filter(None, [equipment.get('model_status'), *candidates]))))
    return rows


def populate_equipment(doc, repair=False):
    """Expose old snapshots in the grid without replacing user-edited rows."""
    if not doc.get('recommendation_json'):
        return
    plan = json.loads(doc.recommendation_json)
    if not doc.get('system_type'):
        doc.system_type = plan.get('system_type')
    if (repair or not doc.get('equipment_initialized')) and not doc.get('recommended_equipment'):
        rows = equipment_from_plan(plan)
        if rows:
            doc.set('recommended_equipment', rows)
            doc.equipment_initialized = 1
    # Match by the original requirement, not row position: users can reorder rows.
    snapshots = equipment_from_plan(plan)
    for row in doc.get('recommended_equipment') or []:
        if row.get('item'):
            continue
        matches = [saved for saved in snapshots
                   if saved.get('item') and saved.get('equipment_type') == row.get('equipment_type')
                   and saved.get('description') == row.get('description')]
        if len(matches) != 1:
            continue
        saved = matches[0]
        row.update({'item': saved['item']})
        for field in ('manufacturer', 'model', 'rate'):
            if not row.get(field) and saved.get(field):
                row.update({field: saved[field]})


def calculate_amounts(rows):
    total = 0
    for row in rows:
        try:
            quantity, rate = float(row.quantity or 0), float(row.rate or 0)
        except (ValueError, TypeError):
            frappe.throw('Equipment quantity and unit price must be numbers.')
        if not math.isfinite(quantity) or quantity <= 0 or not math.isfinite(rate) or rate < 0:
            frappe.throw('Equipment quantity must be positive and unit price must be zero or greater.')
        row.amount = round(quantity * rate, 2)
        if not math.isfinite(row.amount):
            frappe.throw('Equipment amount is too large.')
        total += row.amount
    return round(total, 2)


@frappe.whitelist(methods=['POST'])
def create_quotation(name):
    lead = frappe.get_doc('Customer Lead', name)
    lead.check_permission('read')
    if not frappe.has_permission('ES Quotation', 'create'):
        frappe.throw('You do not have permission to create quotations.', frappe.PermissionError)
    if lead.recommendation_status == 'Pending':
        frappe.throw('Generate a solar recommendation before creating a quotation.')
    populate_equipment(lead)
    if not lead.get('recommended_equipment'):
        frappe.throw('Add recommended equipment before creating a quotation.')
    from eola.inventory import fill_missing_rates
    fill_missing_rates(lead.recommended_equipment)
    validate_catalog_rows(lead.recommended_equipment)
    quotation = frappe.new_doc('ES Quotation')
    quotation.customer_lead = lead.name
    for field in CONTACT_PROJECT_FIELDS:
        quotation.set(field, lead.get(field))
    quotation.system_type = lead.get('system_type')
    for row in lead.recommended_equipment:
        quotation.append('items', {field: row.get(field) for field in EQUIPMENT_FIELDS})
    quotation.total = calculate_amounts(quotation.items)
    # Return an unsaved document: the user reviews and edits it before saving.
    return quotation


def repair_saved_recommendations():
    """Administrative backfill after installing the lead equipment/system fields."""
    from eola.customer_inquiry import generate_inquiry_recommendation

    repaired = []
    for name in frappe.get_all('Customer Lead', pluck='name'):
        doc = frappe.get_doc('Customer Lead', name)
        if not doc.get('recommendation_json'):
            continue
        plan = json.loads(doc.recommendation_json)
        if not plan.get('equipment') and not doc.get('recommended_equipment'):
            generate_inquiry_recommendation(name)
            doc.reload()
        else:
            populate_equipment(doc, repair=True)
            doc.save()
        repaired.append(dict(name=name, system_type=doc.system_type, equipment_rows=len(doc.recommended_equipment)))
    return repaired


def validate_catalog_rows(rows):
    """Require a real item for every lead and quotation equipment row."""
    for row in rows:
        if not row.get('item') or not frappe.db.exists('ES Item', row.get('item')):
            frappe.throw('Every equipment row must link to an existing ES Item. Remove generic rows or select an item.')


def clean_saved_catalog_recommendations():
    """Remove historical generic rows and snapshot entries without an ES Item."""
    items = {row.name: row for row in frappe.get_all('ES Item',
        fields=['name', 'item_name', 'description', 'manufacturer', 'model'])}
    repaired = []
    for name in frappe.get_all('Customer Lead', pluck='name'):
        doc = frappe.get_doc('Customer Lead', name)
        if not doc.get('recommendation_json'):
            continue
        populate_equipment(doc, repair=True)
        plan = json.loads(doc.recommendation_json)
        equipment = []
        for entry in plan.get('equipment', []):
            selected = entry.get('selected_item') if 'selected_item' in entry else next(
                (c for c in entry.get('catalog_candidates', []) if c.get('item') in items), None)
            if not selected or selected.get('item') not in items:
                continue
            master = items[selected['item']]
            selected.update(description=master.description or master.item_name,
                            manufacturer=master.manufacturer, model=master.model)
            entry.update(selected_item=selected, specification=selected['description'],
                         catalog_candidates=[selected])
            equipment.append(entry)
        plan['equipment'] = equipment
        doc.recommendation_json = json.dumps(plan)
        rows = []
        for row in doc.get('recommended_equipment') or []:
            if row.get('item') not in items:
                continue
            master = items[row.item]
            row.description = master.description or master.item_name
            rows.append(row)
        doc.set('recommended_equipment', rows)
        doc.equipment_initialized = 1
        doc.save()
        repaired.append({'name': name, 'items': len(rows)})
    return repaired


def repair_missing_lead_rates():
    from eola.inventory import fill_missing_rates
    frappe.only_for('System Manager')
    results = []
    for name in frappe.get_all('Customer Lead', pluck='name'):
        doc = frappe.get_doc('Customer Lead', name)
        rows = doc.get('recommended_equipment') or []
        before = [row.rate for row in rows]
        fill_missing_rates(rows)
        changed = sum(old != row.rate for old, row in zip(before, rows))
        if changed:
            doc.save()
        results.append({'name': name, 'rates_filled': changed})
    return results
