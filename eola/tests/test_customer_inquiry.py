import unittest
from unittest.mock import MagicMock, patch

from eola.solar_sizing import estimate


class TestSolarSizing(unittest.TestCase):
    def setUp(self):
        self.data = dict(monthly_bill=6000, allocated_budget=400000, electricity_rate=12, desired_reduction=50, roof_shading='None', grid_connection='Connected')

    def test_budget_and_generation_are_consistent(self):
        p = estimate(self.data)
        self.assertLessEqual(p['estimated_cost'], self.data['allocated_budget'])
        self.assertEqual(p['panel_count'], 7)
        self.assertAlmostEqual(p['monthly_kwh'], p['pv_kwp'] * 4.5 * .8 * 30)
        self.assertAlmostEqual(p['monthly_savings'], p['monthly_kwh'] * .7 * 12)
        self.assertTrue(p['target_met'])
        self.assertEqual(p['battery_kwh'], 0)

    def test_low_budget_returns_minimum_setup_and_shortfall(self):
        p = estimate(dict(self.data, allocated_budget=1000))
        self.assertEqual(p['panel_count'], 2)
        self.assertEqual(p['equipment'], [])
        self.assertFalse(p['within_budget'])
        self.assertEqual(p['budget_shortfall'], p['estimated_cost'] - 1000)
        self.assertFalse(p['target_met'])
        self.assertGreater(p['monthly_savings'], 0)

    def test_shading_increases_target_cost(self):
        self.assertGreater(estimate(dict(self.data, roof_shading='Heavy'))['target_cost'], estimate(self.data)['target_cost'])

    def test_hybrid_and_offgrid_have_storage(self):
        hybrid = estimate(dict(self.data, backup_required=1, allocated_budget=1000000))
        offgrid = estimate(dict(self.data, grid_connection='No grid connection', allocated_budget=2000000))
        self.assertEqual(hybrid['system_type'], 'Hybrid')
        self.assertEqual(offgrid['system_type'], 'Off-Grid')
        self.assertGreater(offgrid['battery_kwh'], hybrid['battery_kwh'])
        self.assertGreater(offgrid['target_cost'], hybrid['target_cost'])
        self.assertGreater(offgrid['panel_count'], hybrid['panel_count'])

    def test_savings_and_budget_shortfall_are_consistent(self):
        for budget in [1, 50000, 100000, 250000, 1000000]:
            for target in [1, 50, 100]:
                for backup in [0, 1]:
                    p = estimate(dict(self.data, allocated_budget=budget, desired_reduction=target, backup_required=backup))
                    self.assertLessEqual(p['monthly_savings'], self.data['monthly_bill'])
                    self.assertEqual(p['budget_shortfall'], max(0, round(p['estimated_cost'] - budget, 2)))
                    self.assertEqual(p['within_budget'], p['estimated_cost'] <= budget)
                    self.assertGreaterEqual(p['panel_count'], 2)
                    self.assertGreaterEqual(p['remaining_bill'], 0)

    def test_low_budget_hybrid_has_small_battery_and_offgrid_retains_load(self):
        hybrid = estimate(dict(self.data, backup_required=1, allocated_budget=1000))
        self.assertEqual(hybrid['battery_kwh'], 5.12)
        self.assertEqual(hybrid['panel_count'], 2)
        low = estimate(dict(self.data, grid_connection='No grid connection', allocated_budget=1000))
        high = estimate(dict(self.data, grid_connection='No grid connection', allocated_budget=2000000))
        self.assertEqual(low['panel_count'], high['panel_count'])
        self.assertEqual(low['battery_kwh'], high['battery_kwh'])
        self.assertTrue(low['target_met'])
        self.assertFalse(low['within_budget'])

    def test_roof_area_caps_panels_and_does_not_invent_space(self):
        plan = estimate(dict(self.data, roof_area=9))
        self.assertEqual(plan['panel_count'], 3)
        self.assertFalse(plan['target_met'])
        tiny = estimate(dict(self.data, roof_area=3, allocated_budget=1000))
        self.assertEqual(tiny['equipment'], [])
        self.assertEqual(tiny['estimated_cost'], 0)
        self.assertTrue(any('roof area' in warning for warning in tiny['warnings']))

    def test_catalog_candidates_use_matching_ratings(self):
        p = estimate(self.data, [dict(item='PV-1', equipment_type='PV Module', rated_power=550, model='Model A', available_stock=20), dict(item='PV-2', equipment_type='PV Module', rated_power=400)])
        self.assertEqual([c['item'] for c in p['equipment'][0]['catalog_candidates']], ['PV-1'])


class TestInquiryLocalRecommendation(unittest.TestCase):
    def test_recommendation_stays_local_even_when_ai_is_configured(self):
        from eola import customer_inquiry as api
        doc = MagicMock()
        doc.name = 'LEAD-1'
        doc.as_dict.return_value = dict(monthly_bill=6000, allocated_budget=400000,
            electricity_rate=12, desired_reduction=50, grid_connection='Connected')
        backend = MagicMock()
        backend.conf = {'openai_api_key': 'test-key'}
        backend.get_doc.return_value = doc
        backend.has_permission.return_value = False
        with patch.object(api, 'frappe', backend), patch('socket.socket', side_effect=AssertionError('External network access')):
            result = api.generate_inquiry_recommendation('LEAD-1')
        self.assertEqual(result['name'], 'LEAD-1')
        self.assertEqual(result['status'], 'Estimate Only')
        self.assertGreater(result['plan']['panel_count'], 0)
        self.assertEqual(doc.ai_model, '')
        doc.save.assert_called_once()
        doc.check_permission.assert_any_call('read')
        doc.check_permission.assert_any_call('write')
