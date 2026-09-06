import unittest
from eola.analysis import analyze
from eola.alert_types import classify


class TestAlertTypes(unittest.TestCase):
    def setUp(self):
        self.baseline = [dict(hour=f'{h:02}:00:00', expected_power=5 if 6<h<18 else 0) for h in range(24)]
        self.readings = [dict(reading_time=r['hour'], ac_power=r['expected_power'], inverter_status='Normal') for r in self.baseline]

    def detect(self, **kwargs):
        result = analyze(self.readings, self.baseline, 'Grid-Tied', allow_missing=True)
        return classify(self.readings, result, **kwargs)

    def test_fault_overrides_zero_and_underperformance_but_retains_tags(self):
        self.readings[12].update(inverter_status='Fault', ac_power=0)
        result = self.detect()
        self.assertEqual(result['primary'], 'Inverter Fault')
        self.assertIn('Unexpected Zero Generation', result['tags'])
        self.assertIn('Underperformance', result['tags'])

    def test_zero_daytime_only(self):
        self.assertIsNone(self.detect()['primary'])
        self.readings[12]['ac_power'] = 0
        self.assertEqual(self.detect()['primary'], 'Unexpected Zero Generation')

    def test_missing_is_unknown_not_zero_and_does_not_trigger_shortfall(self):
        self.readings.pop(12)
        result = analyze(self.readings, self.baseline, 'Grid-Tied', allow_missing=True)
        self.assertIsNone(result['rows'][12]['actual'])
        detected = self.detect(load_recorded=True, daily_load=100)
        self.assertEqual(list(detected['tags']), ['Missing Telemetry / Communication Loss'])

    def test_offline_not_zero_generation(self):
        self.readings[12].update(inverter_status='Offline', ac_power=0)
        detected = self.detect()
        self.assertEqual(detected['primary'], 'Missing Telemetry / Communication Loss')
        self.assertNotIn('Unexpected Zero Generation', detected['tags'])

    def test_limits_require_configuration_and_measurements(self):
        self.readings[12].update(temperature=80, ac_voltage=270)
        self.assertIsNone(self.detect()['primary'])
        result = self.detect(limits=dict(temperature_alert_limit=75, ac_voltage_min=210, ac_voltage_max=250))
        self.assertEqual(result['primary'], 'Overtemperature')
        self.assertIn('Abnormal Voltage', result['tags'])

    def test_capacity_and_underperformance_remain_distinct(self):
        self.assertEqual(self.detect(load_recorded=True, daily_load=60)['primary'], 'Capacity Shortfall')
        self.readings[12]['ac_power'] = 3
        self.assertEqual(self.detect()['primary'], 'Underperformance')
