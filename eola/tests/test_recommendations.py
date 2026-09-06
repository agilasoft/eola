import unittest
from eola.recommendations import recommendation_text, validate_top_five


class TestRecommendationText(unittest.TestCase):
    def test_five_numbered_multiline_entries(self):
        validate_top_five('1. Cloud cover\n   Verify irradiance.\n2. Shading\n3. Soiling\n4. Derating\n5. Baseline mismatch', 'Reasons')

    def test_missing_extra_or_duplicate_entries_rejected(self):
        for value in ['One cause', '1. A\n2. B\n3. C\n4. D', '1. A\n2. B\n3. C\n4. D\n5. E\n6. F', '1. A\n2. B\n3. C\n4. D\n4. E', None]:
            with self.assertRaises(ValueError):
                validate_top_five(value, 'Reasons')

    def test_review_text_preserves_proposal_and_modified_actions(self):
        text = recommendation_text(dict(finding='22% below baseline', possible_causes='Cloud cover', recommended_action='Inspect logs', technician_decision='Modify', technician_modification='Verify sensor first'))
        for value in ['22% below baseline', 'Cloud cover', 'Inspect logs', 'Modify', 'Verify sensor first']:
            self.assertIn(value, text)

    def test_tagged_table_excludes_normal_and_preserves_measured_values(self):
        from eola.recommendations import tagged_readings
        rows = tagged_readings(dict(name='TEL-1', telemetry_date='2026-09-04', readings=[
            dict(reading_time='12:00:00', ac_power=2, expected_power=4, power_deviation=-50, reading_status='Alert'),
            dict(reading_time='09:00:00', ac_power=3.2, expected_power=4, power_deviation=-20, reading_status='Warning'),
            dict(reading_time='10:00:00', ac_power=4, expected_power=4, power_deviation=0, reading_status='Normal'),
        ]))
        self.assertEqual([r['reading_time'] for r in rows], ['09:00:00', '12:00:00'])
        self.assertEqual(rows[0]['telemetry'], 'TEL-1')
        self.assertEqual(rows[0]['power_deviation'], -20)
        self.assertEqual(rows[1]['ac_power'], 2)
        self.assertEqual(rows[1]['expected_power'], 4)

    def test_normal_telemetry_has_no_tagged_rows(self):
        from eola.recommendations import tagged_readings
        self.assertEqual(tagged_readings(dict(readings=[dict(reading_time='12:00:00', reading_status='Normal')])), [])


class TestCapacityAssessments(unittest.TestCase):
    def test_growth_and_shortfall_add_conditional_actions_with_stock(self):
        from eola.recommendations import add_capacity_assessments
        output = dict(recommended_action='\n'.join(f'{i}. Verify evidence' for i in range(1,6)))
        context = dict(recent_telemetry=[dict(load_recorded=1, daily_load_energy=10),
            dict(load_recorded=1, daily_load_energy=30, daily_energy_production=20)],
            catalog_stock=[dict(name='PV-1', equipment_type='PV Module', available_stock=12),
                           dict(name='PV-EMPTY', equipment_type='PV Module', available_stock=0)])
        result = add_capacity_assessments(context, output)
        self.assertIn('Needs upgrade assessment', result['recommended_action'])
        self.assertIn('Needs replacement assessment', result['recommended_action'])
        self.assertIn('PV-1', result['recommended_action'])
        self.assertNotIn('PV-EMPTY', result['recommended_action'])
        self.assertIn('EOLA workflow added', result['supporting_evidence'])
        self.assertIs(add_capacity_assessments({}, output), output)
