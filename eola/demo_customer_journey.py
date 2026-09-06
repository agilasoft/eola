"""Explicit demo journey, with real document workflow and labeled simulated evidence."""
import json
import math

import frappe
from frappe.utils import add_days, today

DEMO_ID = 'eola-demo-upgrade-customer-2026-09'


def create():
    from eola.customer_inquiry import submit_inquiry, generate_inquiry_recommendation
    from eola.quotation import create_quotation
    from eola.api import analyze_telemetry

    frappe.only_for('System Manager')
    if frappe.db.exists('Customer Lead', {'submission_id': DEMO_ID}):
        return inspect()
    accepted = add_days(today(), -7)
    inquiry = dict(first_name='Demo Sofia', last_name='Reyes', phone='+639000000000',
        email='sofia.reyes.demo@example.com', country='Philippines',
        full_address='DEMO residence, Quezon City, Philippines', property_type='Residential',
        ownership_status='Owner', roof_type='Metal', roof_shading='None', roof_age=3,
        roof_area=90, monthly_bill=8000, allocated_budget=400000, desired_reduction=50,
        electricity_rate=12, grid_connection='Connected', backup_required=0,
        processing_consent=1, comments='SIMULATED customer journey requested for demonstration; no real customer or consent assertion.')
    lead_name = submit_inquiry(inquiry, DEMO_ID)['name']
    result = generate_inquiry_recommendation(lead_name)
    quotation = create_quotation(lead_name)
    quotation.quotation_date = accepted
    quotation.valid_till = add_days(accepted, 30)
    quotation.notes = 'SIMULATED acceptance last week; demonstration only.'
    quotation.status = 'Draft'
    quotation.insert()
    quotation.status = 'Accepted'
    quotation.save()
    quotation.db_set('accepted_on', accepted)
    plan = result['plan']
    system = frappe.get_doc(dict(doctype='Installed Solar System',
        system_name='DEMO Sofia Reyes — appliance growth, 5 days', customer=quotation.customer,
        installation_date=add_days(today(), -6), system_type='Grid-Tied', system_status='Active',
        monitoring_status='Monitoring', total_pv_capacity=plan['pv_kwp'],
        total_inverter_capacity=plan['inverter_kw'], number_of_pv_modules=plan['panel_count'],
        number_of_inverters=1, location=inquiry['full_address'],
        notes=f'SIMULATED system. Accepted quotation {quotation.name}; catalog compatibility requires installer verification.')).insert()
    equipment = []
    for row in quotation.items:
        for index in range(int(row.quantity)):
            unit = frappe.get_doc(dict(doctype='Installed Equipment',
                equipment_name=f'DEMO {row.item} unit {index+1}', installed_solar_system=system.name,
                item=row.item, equipment_type=row.equipment_type, manufacturer=row.manufacturer,
                model=row.model, serial_number=f'DEMO-{quotation.name}-{row.item}-{index+1}',
                installation_date=system.installation_date, equipment_status='Active',
                notes='SIMULATED installed unit; no physical installation recorded.')).insert()
            equipment.append(unit.name)
    curve = [round(max(0, math.sin(math.pi * (hour-6)/12)) * plan['pv_kwp'] * .8, 3)
             if 6 <= hour <= 18 else 0 for hour in range(24)]
    baseline = frappe.get_doc(dict(doctype='Performance Baseline', baseline_name=f'DEMO baseline {system.name}',
        installed_solar_system=system.name, baseline_type='Time of Day', active=1,
        effective_from=add_days(today(), -6), notes='SIMULATED hourly mean AC power baseline.',
        hours=[dict(hour=f'{hour:02}:00:00', expected_power=value,
                    minimum_expected_power=value*.85, maximum_expected_power=value*1.15)
               for hour, value in enumerate(curve)])).insert()
    for index, factor in enumerate([1, 1, 1, .78, .62]):
        telemetry = frappe.get_doc(dict(doctype='Telemetry', installed_solar_system=system.name,
            telemetry_date=add_days(today(), index-5), data_source='Simulated', reading_interval='1 Hour',
            load_recorded=1, daily_load_energy=[16,18,40,44,48][index],
            appliance_changes='SIMULATED: original household appliances.' if index<2 else
                'SIMULATED customer report: two additional air conditioners and an electric cooker introduced on day 3; verify with a load survey.',
            notes='DEMO: first two days normal; day 3 demand increase only; days 4-5 also show generation underperformance. Fault cause is not established.',
            equipment=[dict(installed_equipment=name) for name in equipment],
            readings=[dict(reading_time=f'{hour:02}:00:00', ac_power=round(value*factor,3),
                           inverter_status='Normal' if value else 'Standby') for hour,value in enumerate(curve)])).insert()
        analyze_telemetry(telemetry.name)
    return inspect()


def inspect():
    lead = frappe.db.get_value('Customer Lead', {'submission_id': DEMO_ID}, 'name')
    quotations = frappe.get_all('ES Quotation', filters={'customer_lead': lead},
        fields=['name','status','accepted_on','customer','total'])
    systems = frappe.get_all('Installed Solar System', filters={'customer': quotations[0].customer},
        fields=['name','system_name']) if quotations else []
    telemetry = frappe.get_all('Telemetry', filters={'installed_solar_system': systems[0].name},
        fields=['name','telemetry_date','daily_energy_production','daily_load_energy','performance_status','performance_alert'],
        order_by='telemetry_date asc') if systems else []
    return dict(lead=lead, quotations=quotations, systems=systems, telemetry=telemetry)


def recommend(refresh=False):
    from eola.api import generate_recommendation
    frappe.only_for('System Manager')
    info = inspect()
    # Latest alert contains the complete five-day history and current stock snapshot.
    latest = info['telemetry'][-1]
    if refresh:
        from eola.api import recommendation_context
        from eola.openai_provider import generate_recommendation as provider
        from frappe.utils import now_datetime
        context = recommendation_context(latest.performance_alert)
        from eola.recommendations import add_capacity_assessments
        output = add_capacity_assessments(context, provider(context))
        recommendation = frappe.get_doc(dict(doctype='AI Recommendation',
            recommendation_name='DEMO upgrade / replacement assessment', performance_alert=latest.performance_alert,
            generated_on=now_datetime(), input_summary=json.dumps(context, default=str, indent=2), **output)).insert().name
    else:
        recommendation = generate_recommendation(latest.performance_alert)
    return {'recommendation': recommendation, **info}


def diversify_alerts():
    """User-approved amendment of this demo only; preserve original evidence in comments."""
    from eola.analysis import analyze, hour_index
    from eola.alert_types import classify
    from frappe.utils import escape_html

    frappe.only_for('System Manager')
    info = inspect()
    if not info.get('systems') or len(info['telemetry']) != 5:
        frappe.throw('Expected the five-day demo journey.')
    system = frappe.get_doc('Installed Solar System', info['systems'][0].name)
    if not system.system_name.startswith('DEMO Sofia Reyes'):
        frappe.throw('Only the approved demo can be amended.')
    if 'DEMO-ALERT-DIVERSITY-v1' in (system.notes or ''):
        return inspect()
    # Refuse to modify evidence for any reviewed service action.
    for row in info['telemetry']:
        if row.performance_alert:
            alert = frappe.get_doc('Performance Alert', row.performance_alert)
            if alert.status not in ('New Alert', 'Under Review'):
                frappe.throw('A demo alert has been reviewed; retain its evidence unchanged.')
    for index, row in enumerate(info['telemetry']):
        doc = frappe.get_doc('Telemetry', row.name)
        original = doc.as_dict()
        baseline_name = json.loads(doc.analysis_summary)['baseline']
        baseline = frappe.get_doc('Performance Baseline', baseline_name)
        if index == 3:
            doc.add_comment('Comment', text=escape_html('Approved demo correction; previous telemetry evidence: ' + json.dumps(original, default=str)))
            for reading in doc.readings:
                if hour_index(reading.reading_time) in (12, 13):
                    reading.inverter_status = 'Fault'
                    reading.ac_power = 0
                    reading.remarks = 'SIMULATED explicit inverter fault; zero output during this hour. Technician diagnosis required.'
        result = analyze(doc.readings, baseline.hours, system.system_type, allow_missing=True)
        detected = classify(doc.readings, result, system.as_dict(), doc.load_recorded, doc.daily_load_energy)
        for reading in doc.readings:
            calculated = result['rows'][hour_index(reading.reading_time)]
            reading.expected_power = calculated['expected']
            reading.power_deviation = calculated['deviation']
            reading.reading_status = calculated['status']
            if reading.inverter_status == 'Fault':
                reading.reading_status = 'Alert'
        doc.daily_energy_production = result['daily_energy']
        doc.expected_daily_energy = result['expected_energy']
        doc.performance_deviation = result['deviation']
        doc.maximum_output = result['maximum']
        doc.average_daytime_output = result['average']
        doc.performance_status = detected['severity']
        doc.alert_tags = '\n'.join(detected['tags'])
        evidence = json.loads(doc.analysis_summary)
        evidence.update(result)
        evidence['detected_alerts'] = detected
        evidence['demo_amendment'] = 'User-approved alert variety; day 4 explicit inverter faults at 12:00 and 13:00.'
        doc.analysis_summary = json.dumps(evidence, default=str, indent=2)
        doc.flags.eola_analysis = True
        doc.save()
        if doc.performance_alert:
            alert = frappe.get_doc('Performance Alert', doc.performance_alert)
            alert.add_comment('Comment', text=escape_html('Approved demo retagging; prior evidence: ' + (alert.evidence_summary or '')))
            alert.alert_type = detected['primary']
            alert.alert_name = f'{alert.alert_type} — {system.system_name} — {doc.telemetry_date}'
            alert.alert_tags = doc.alert_tags
            alert.severity = detected['severity']
            alert.evidence_summary = doc.analysis_summary
            alert.detection_rule = detected['rule']
            hours = detected['tags'][detected['primary']]
            affected = [r for r in result['rows'] if r['hour'] in hours]
            alert.start_time = f'{hours[0]:02}:00:00'
            alert.end_time = f'{(hours[-1]+1)%24:02}:00:00'
            alert.duration = len(hours)*3600
            alert.expected_performance = doc.daily_load_energy if alert.alert_type == 'Capacity Shortfall' else sum(r['expected'] for r in affected)/len(affected)
            alert.actual_performance = doc.daily_energy_production if alert.alert_type == 'Capacity Shortfall' else sum(r['actual'] for r in affected)/len(affected)
            alert.deviation = (alert.actual_performance-alert.expected_performance)/alert.expected_performance*100 if alert.expected_performance else 0
            alert.flags.eola_analysis = True
            alert.save()
            if alert.resolution_issue:
                issue = frappe.get_doc('ES Issue', alert.resolution_issue)
                issue.subject = alert.alert_name
                issue.description = doc.analysis_summary
                issue.priority = 'High' if alert.severity == 'Critical' else 'Medium'
                issue.save()
    system.notes = (system.notes or '') + '\nDEMO-ALERT-DIVERSITY-v1: approved fault scenario on day 4.'
    system.save()
    return inspect()
