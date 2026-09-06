"""Evidence-based alert tags; explicit faults take priority over output symptoms."""
from eola.analysis import hour_index

ALERT_TYPES = ['Missing Telemetry / Communication Loss', 'Inverter Fault',
               'Unexpected Zero Generation', 'Overtemperature', 'Abnormal Voltage',
               'Underperformance', 'Capacity Shortfall']


def classify(readings, result, limits=None, load_recorded=False, daily_load=0):
    limits = limits or {}
    readings = {hour_index(row.get('reading_time')): row for row in readings}
    tags = {tag: [] for tag in ALERT_TYPES}
    for calculated in result['rows']:
        hour = calculated['hour']
        row = readings.get(hour)
        if row is None or row.get('inverter_status') == 'Offline':
            tags[ALERT_TYPES[0]].append(hour)
            if row is None:
                continue
        if row.get('inverter_status') == 'Fault':
            tags['Inverter Fault'].append(hour)
        if calculated['expected'] > 0 and calculated['actual'] == 0 and row.get('inverter_status') != 'Offline':
            tags['Unexpected Zero Generation'].append(hour)
        temperature_limit = float(limits.get('temperature_alert_limit') or 0)
        if temperature_limit and row.get('temperature') is not None and float(row.get('temperature') or 0) > temperature_limit:
            tags['Overtemperature'].append(hour)
        voltage = row.get('ac_voltage')
        low, high = float(limits.get('ac_voltage_min') or 0), float(limits.get('ac_voltage_max') or 0)
        # Unpopulated numeric fields default to zero; require a positive measured voltage.
        if voltage and ((low and float(voltage) < low) or (high and float(voltage) > high)):
            tags['Abnormal Voltage'].append(hour)
        if calculated['status'] in ('Warning', 'Alert') and calculated['actual'] is not None and row.get('inverter_status') != 'Offline':
            tags['Underperformance'].append(hour)
    if load_recorded and not tags[ALERT_TYPES[0]] and float(daily_load or 0) > result['daily_energy']:
        tags['Capacity Shortfall'] = list(range(24))
    tags = {tag: hours for tag, hours in tags.items() if hours}
    primary = next(iter(tags), None)
    severe = primary in ('Inverter Fault', 'Unexpected Zero Generation', 'Overtemperature', 'Abnormal Voltage')
    severity = 'Critical' if severe else result['status'] if primary == 'Underperformance' else 'Warning' if primary else 'Normal'
    return dict(primary=primary, tags=tags, severity=severity,
                rule='EOLA-EVIDENCE-TAGS-v1', limits={key: limits.get(key) for key in
                    ('temperature_alert_limit', 'ac_voltage_min', 'ac_voltage_max')})
