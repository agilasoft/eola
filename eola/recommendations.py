"""Recommendation text shared by telemetry, alerts and service cases."""
import re


def validate_top_five(value, label):
    if not isinstance(value, str):
        raise ValueError(f'{label} must be long text numbered 1 through 5.')
    entries = re.findall(r'^\s*(\d+)[.)]\s+(.+)', value, re.MULTILINE)
    if [n for n, _ in entries] != ['1', '2', '3', '4', '5']:
        raise ValueError(f'{label} must contain exactly five entries numbered 1 through 5.')


def recommendation_text(doc):
    sections = [('Why this telemetry was flagged', doc.get('finding')),
                ('Top 5 possible reasons', doc.get('possible_causes')),
                ('Top 5 recommended actions for technician approval', doc.get('recommended_action')),
                ('Supporting evidence', doc.get('supporting_evidence')),
                ('Technician decision', doc.get('technician_decision') or 'Pending'),
                ('Technician-approved modified actions', doc.get('technician_modification')),
                ('Technician remarks', doc.get('technician_remarks')),
                ('Review note', doc.get('ai_disclaimer'))]
    return '\n\n'.join(f'{label}\n{value}' for label, value in sections if value)


def sync_recommendation(doc):
    import frappe
    text = recommendation_text(doc)
    alert = frappe.get_doc('Performance Alert', doc.performance_alert)
    frappe.db.set_value('Performance Alert', alert.name, 'ai_recommendation_text', text)
    if alert.telemetry:
        frappe.db.set_value('Telemetry', alert.telemetry, 'ai_recommendation_text', text)
    if alert.resolution_issue:
        frappe.db.set_value('ES Issue', alert.resolution_issue, 'ai_recommendation_text', text)


def tagged_readings(telemetry):
    """Copy analyzed tags, never infer new ones or include normal readings."""
    from eola.analysis import hour_index
    return [dict(telemetry=telemetry.get('name'),
                 telemetry_date=telemetry.get('telemetry_date'),
                 **{field: row.get(field) for field in
                    ('reading_time', 'ac_power', 'expected_power', 'power_deviation', 'reading_status')})
            for row in sorted(telemetry.get('readings') or [], key=lambda r: hour_index(r.get('reading_time')))
            if row.get('reading_status') in ('Warning', 'Alert')]


def populate_tagged_readings(doc, alert):
    import frappe
    telemetry = frappe.get_doc('Telemetry', alert.telemetry)
    telemetry.check_permission('read')
    doc.set('tagged_readings', tagged_readings(telemetry))


def stock_and_load_context(alert):
    import frappe
    from frappe.utils import add_days, now_datetime
    from eola.inventory import stock_balances

    balances = stock_balances()
    items = frappe.get_list('ES Item', filters={'disabled': 0},
        fields=['name', 'item_name', 'equipment_type', 'manufacturer', 'model'], limit_page_length=0)
    prices = {r.item: r.rate for r in frappe.get_list('ES Item Price', filters={'disabled': 0},
        fields=['item', 'rate'], limit_page_length=0)} if frappe.has_permission('ES Item Price', 'read') else {}
    for item in items:
        item['available_stock'] = balances.get(item.name, 0)
        item['rate_php'] = prices.get(item.name)
    history = frappe.get_list('Telemetry', filters={'installed_solar_system': alert.installed_solar_system,
        'telemetry_date': ['between', [add_days(alert.alert_date, -4), alert.alert_date]], 'analysis_status': 'Analyzed'},
        fields=['name', 'telemetry_date', 'daily_energy_production', 'expected_daily_energy',
                'load_recorded', 'daily_load_energy', 'appliance_changes', 'data_source', 'reading_count', 'alert_tags'],
        order_by='telemetry_date asc', limit_page_length=5)
    installed = frappe.get_list('Installed Equipment', filters={'installed_solar_system': alert.installed_solar_system},
        fields=['name', 'item', 'equipment_type', 'model', 'equipment_status'], limit_page_length=0)
    return dict(stock_as_of=str(now_datetime()), catalog_stock=items, recent_telemetry=history,
                installed_equipment=installed,
                decision_guidance='Needs upgrade: assess confirmed growing consumption and energy shortfall. '
                'Needs replacement: only if fault verification supports it. Lower generation alone does not prove increased appliances or a failed item. '
                'Recommend only existing catalog item IDs with enough stock; stock is not reserved. '
                'Verify sizing, voltage, phase, battery and inverter compatibility before selecting quantities. '
                'If no compatible item is available, recommend procurement/review, not an unavailable item. '
                'Daily generation versus consumption does not measure time-of-use self-consumption or grid imports. All actions need technician approval.')


def add_capacity_assessments(context, output):
    """Keep required conditional workflow assessments visible, distinct from model findings."""
    history = [row for row in context.get('recent_telemetry', []) if row.get('load_recorded') and row.get('reading_count', 24) == 24 and 'Missing Telemetry' not in (row.get('alert_tags') or '')]
    if len(history) < 2:
        return output
    first, latest = history[0], history[-1]
    if not (float(latest.get('daily_load_energy') or 0) > float(first.get('daily_load_energy') or 0)
            and float(latest.get('daily_load_energy') or 0) > float(latest.get('daily_energy_production') or 0)):
        return output
    actions = re.findall(r'^\s*\d+[.)]\s+(.+)', output['recommended_action'], re.MULTILINE)
    if len(actions) != 5:
        return output
    available = [f"{row['name']} ({row['available_stock']:g} units)"
                 for row in context.get('catalog_stock', [])
                 if row.get('equipment_type') == 'PV Module' and row.get('available_stock', 0) > 0]
    stock_note = 'review available PV items ' + ', '.join(available[:3]) if available else 'review procurement because no PV item has available stock'
    actions[3] = 'Needs upgrade assessment: confirm increased load, survey capacity and compatibility, and ' + stock_note + ' before sizing or quoting an expansion.'
    actions[4] = 'Needs replacement assessment: test for a confirmed equipment fault first, then verify a compatible ES Item and sufficient stock before proposing replacement; increased consumption alone is not a fault.'
    output = dict(output)
    output['recommended_action'] = '\n'.join(f'{i}. {action}' for i, action in enumerate(actions, 1))
    output['supporting_evidence'] = (output.get('supporting_evidence') or '') + '\nEOLA workflow added conditional upgrade and replacement assessments using recorded load growth and energy shortfall; these are technician checks, not AI-confirmed faults or compatibility.'
    return output
