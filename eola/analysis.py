"""Deterministic MVP analysis. Each reading is mean kW over its starting hour."""
from datetime import time, timedelta
from math import isfinite


def hour_index(value):
	if isinstance(value, timedelta):
		seconds = value.total_seconds()
	elif isinstance(value, time):
		seconds = value.hour * 3600 + value.minute * 60 + value.second + value.microsecond / 1e6
	else:
		parts = str(value).split(":")
		if len(parts) not in (2, 3):
			raise ValueError("Use an hourly time between 00:00 and 23:00.")
		hours, minutes = int(parts[0]), int(parts[1])
		second = float(parts[2]) if len(parts) == 3 else 0
		if not 0 <= hours <= 23 or not 0 <= minutes < 60 or not 0 <= second < 60:
			raise ValueError("Invalid clock time.")
		seconds = hours * 3600 + minutes * 60 + second
	if not 0 <= seconds < 86400 or seconds % 3600:
		raise ValueError("Readings and baselines must fall on exact hours from 00:00 to 23:00.")
	return int(seconds // 3600)


def hourly_map(rows, time_field):
	result = {}
	for row in rows:
		hour = hour_index(row.get(time_field))
		if hour in result:
			raise ValueError("Duplicate hours are not allowed.")
		result[hour] = row
	if set(result) != set(range(24)):
		raise ValueError("MVP analysis requires all 24 hourly readings and baseline hours.")
	return result


def power(value):
	value = float(value or 0)
	if not isfinite(value) or value < 0:
		raise ValueError("Power must be a finite, nonnegative number.")
	return value


def analyze(readings, baseline, system_type):
	if system_type != "Grid-Tied":
		raise ValueError("MVP underperformance analysis supports Grid-Tied systems only. Off-Grid and Hybrid analysis require load, battery and curtailment context.")
	actual = hourly_map(readings, "reading_time")
	expected = hourly_map(baseline, "hour")
	rows = []
	for hour in range(24):
		a, e = power(actual[hour].get("ac_power")), power(expected[hour].get("expected_power"))
		deviation = round((a - e) / e * 100, 8) if e else 0
		status = "Alert" if e > 0 and deviation <= -30 else "Warning" if e > 0 and deviation <= -15 else "Normal"
		rows.append(dict(hour=hour, actual=a, expected=e, deviation=deviation, status=status))
	daytime = [r for r in rows if r['expected'] > 0]
	if not daytime:
		raise ValueError("The baseline must contain positive daytime expected power.")
	bad = [r for r in rows if r['status'] != 'Normal']
	energy, expected_energy = sum(r['actual'] for r in rows), sum(r['expected'] for r in rows)
	return dict(rows=rows, daily_energy=energy, expected_energy=expected_energy,
		deviation=(energy - expected_energy) / expected_energy * 100,
		maximum=max(r['actual'] for r in rows), average=sum(r['actual'] for r in daytime) / len(daytime),
		status='Critical' if any(r['status'] == 'Alert' for r in bad) else 'Warning' if bad else 'Normal',
		bad=bad)
