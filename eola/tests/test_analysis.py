import unittest
from datetime import timedelta

from eola.analysis import analyze, hour_index


class TestAnalysis(unittest.TestCase):
	def setUp(self):
		self.baseline = [{"hour": f"{h:02}:00:00", "expected_power": 7 if 6 <= h < 18 else 0} for h in range(24)]
		self.readings = [{"reading_time": row["hour"], "ac_power": row["expected_power"]} for row in self.baseline]

	def test_normal_day_and_night(self):
		result = analyze(self.readings, self.baseline, "Grid-Tied")
		self.assertEqual(result["daily_energy"], 84)
		self.assertEqual(result["status"], "Normal")
		self.assertEqual(result["average"], 7)
		self.assertEqual(result["rows"][0]["deviation"], 0)

	def test_four_hour_underperformance(self):
		for hour in range(12, 16):
			self.readings[hour]["ac_power"] = 4.8
		result = analyze(self.readings, self.baseline, "Grid-Tied")
		self.assertEqual(result["status"], "Critical")
		self.assertEqual([r["hour"] for r in result["bad"]], [12, 13, 14, 15])
		self.assertAlmostEqual(result["rows"][12]["deviation"], -31.4285714)
		self.assertAlmostEqual(result["daily_energy"], 75.2)

	def test_warning(self):
		self.readings[12]["ac_power"] = 5.6
		self.assertEqual(analyze(self.readings, self.baseline, "Grid-Tied")["status"], "Warning")

	def test_disjoint_hours(self):
		for hour in (8, 15):
			self.readings[hour]["ac_power"] = 0
		self.assertEqual(len(analyze(self.readings, self.baseline, "Grid-Tied")["bad"]), 2)

	def test_incomplete_and_duplicate_data(self):
		with self.assertRaises(ValueError):
			analyze(self.readings[:-1], self.baseline, "Grid-Tied")
		self.readings[-1]["reading_time"] = "00:00:00"
		with self.assertRaises(ValueError):
			analyze(self.readings, self.baseline, "Grid-Tied")

	def test_unsupported_systems(self):
		for kind in ("Hybrid", "Off-Grid"):
			with self.assertRaisesRegex(ValueError, "load, battery"):
				analyze(self.readings, self.baseline, kind)

	def test_invalid_power(self):
		for value in (-1, float("nan"), float("inf")):
			self.readings[12]["ac_power"] = value
			with self.assertRaises(ValueError):
				analyze(self.readings, self.baseline, "Grid-Tied")

	def test_zero_baseline(self):
		for row in self.baseline:
			row["expected_power"] = 0
		with self.assertRaisesRegex(ValueError, "positive daytime"):
			analyze(self.readings, self.baseline, "Grid-Tied")

	def test_time_formats(self):
		self.assertEqual(hour_index(timedelta(hours=12)), 12)
		for value in ("12:15:00", "24:00:00", "-1:00:00", "11:60:00"):
			with self.assertRaises(ValueError):
				hour_index(value)

	def test_threshold_boundaries(self):
		for actual, status in ((5.95, "Warning"), (4.9, "Critical")):
			self.readings[12]["ac_power"] = actual
			self.assertEqual(analyze(self.readings, self.baseline, "Grid-Tied")["status"], status)
