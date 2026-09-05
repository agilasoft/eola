import json

import frappe
from frappe.utils import getdate, now_datetime, nowdate

from eola.analysis import analyze, hour_index


def writable(doctype, name):
	doc = frappe.get_doc(doctype, name)
	doc.check_permission("write")
	return doc


def lock(doctype, name):
	# Serialize repeated requests so one alert/case/review is created per record.
	frappe.db.get_value(doctype, name, "name", for_update=True)


@frappe.whitelist(methods=["POST"])
def analyze_telemetry(name):
	lock("Telemetry", name)
	doc = writable("Telemetry", name)
	if doc.analysis_status == "Analyzed":
		return doc.performance_alert
	if doc.reading_interval != "1 Hour":
		frappe.throw("MVP analysis supports the 1 Hour reading interval only.")
	system = frappe.get_doc("Installed Solar System", doc.installed_solar_system)
	system.check_permission("read")
	baselines = frappe.get_list("Performance Baseline", filters={"installed_solar_system": system.name, "active": 1, "effective_from": ["<=", doc.telemetry_date]}, fields=["name", "effective_to", "equipment"], limit_page_length=0)
	# Telemetry measures the whole system; equipment-specific baselines cannot be substituted.
	baselines = [b for b in baselines if not b.equipment and (not b.effective_to or getdate(b.effective_to) >= getdate(doc.telemetry_date))]
	if len(baselines) != 1:
		frappe.throw("Select exactly one active system-wide baseline covering the telemetry date; resolve missing or overlapping baselines first.")
	baseline = frappe.get_doc("Performance Baseline", baselines[0].name)
	baseline.check_permission("read")
	try:
		result = analyze(doc.readings, baseline.hours, system.system_type)
	except ValueError as exc:
		frappe.throw(str(exc))
	for row in doc.readings:
		calculated = result["rows"][hour_index(row.reading_time)]
		row.expected_power = calculated["expected"]
		row.power_deviation = calculated["deviation"]
		row.reading_status = calculated["status"]
	doc.daily_energy_production = result["daily_energy"]
	doc.expected_daily_energy = result["expected_energy"]
	doc.performance_deviation = result["deviation"]
	doc.maximum_output = result["maximum"]
	doc.average_daytime_output = result["average"]
	doc.performance_status = result["status"]
	doc.anomaly_detected = bool(result["bad"])
	doc.analysis_status = "Analyzed"
	evidence = dict(baseline=baseline.name, baseline_modified=str(baseline.modified), system_type=system.system_type,
		pv_capacity_kwp=system.total_pv_capacity, inverter_capacity_kw=system.total_inverter_capacity,
		rule="Hourly mean AC power: warning <= -15%; critical <= -30%; positive baseline hours only.",
		interval="Each reading covers [hour, hour + 1). Disjoint affected hours are listed separately; duration is their sum.",
		**result)
	doc.analysis_summary = json.dumps(evidence, indent=2)
	if result["bad"]:
		bad = result["bad"]
		expected = sum(r["expected"] for r in bad) / len(bad)
		actual = sum(r["actual"] for r in bad) / len(bad)
		alert = frappe.get_doc(dict(doctype="Performance Alert", alert_name=f"Underperformance — {system.system_name} — {doc.telemetry_date}",
			telemetry=doc.name, customer=system.customer, installed_solar_system=system.name,
			alert_date=doc.telemetry_date, alert_type="Underperformance", severity=result["status"],
			start_time=f'{bad[0]["hour"]:02}:00:00', end_time=f'{(bad[-1]["hour"] + 1) % 24:02}:00:00',
			duration=len(bad)*3600, expected_performance=expected, actual_performance=actual,
			deviation=(actual-expected)/expected*100, detection_rule="EOLA-GRID-HOURLY-v1",
			evidence_summary=doc.analysis_summary))
		alert.flags.eola_analysis = True
		alert.insert()
		issue = frappe.get_doc(dict(doctype="ES Issue", subject=alert.alert_name, customer=system.customer,
			status="New Alert", priority="High" if result["status"] == "Critical" else "Medium",
			description=doc.analysis_summary, telemetry=doc.name, performance_alert=alert.name,
			installed_solar_system=system.name)).insert()
		alert.resolution_issue = issue.name
		alert.save()
		doc.performance_alert = alert.name
	doc.flags.eola_analysis = True
	doc.save()
	lock("Installed Solar System", system.name)
	latest = frappe.db.get_value("Installed Solar System", system.name, "last_telemetry_date")
	if not latest or getdate(doc.telemetry_date) >= getdate(latest):
		frappe.db.set_value("Installed Solar System", system.name, {"last_telemetry_date": doc.telemetry_date, "last_performance_status": doc.performance_status})
	return doc.performance_alert


@frappe.whitelist()
def recommendation_context(alert_name):
	"""Permission-filtered evidence for a future model adapter or manual AI run."""
	alert = frappe.get_doc("Performance Alert", alert_name)
	alert.check_permission("read")
	history = frappe.get_list("ES Issue", filters={"installed_solar_system": alert.installed_solar_system, "status": ["in", ["Resolved", "Closed"]]}, fields=["name", "subject", "resolution", "resolved_date", "service_type"], order_by="resolved_date desc", limit_page_length=20)
	return {"alert": alert.name, "evidence": alert.evidence_summary, "service_history": history}


@frappe.whitelist(methods=["POST"])
def review_recommendation(name, decision, modification=None, remarks=None):
	if decision not in ("Accept", "Modify", "Reject"):
		frappe.throw("Choose Accept, Modify, or Reject.")
	if decision == "Modify" and not (modification or "").strip():
		frappe.throw("Describe the technician's modified action.")
	if decision == "Reject" and not (remarks or "").strip():
		frappe.throw("Provide a reason for rejecting the recommendation.")
	initial = frappe.get_doc("AI Recommendation", name)
	initial.check_permission("write")
	lock("Performance Alert", initial.performance_alert)
	lock("AI Recommendation", name)
	recommendation = writable("AI Recommendation", name)
	alert = writable("Performance Alert", recommendation.performance_alert)
	if recommendation.technician_decision != "Pending":
		frappe.throw("This recommendation has already been reviewed.")
	if alert.status in ("Confirmed", "Resolved", "Dismissed"):
		frappe.throw("This alert has already received a technician decision.")
	issue = writable("ES Issue", alert.resolution_issue)
	recommendation.technician_decision = decision
	recommendation.technician_modification = modification if decision == "Modify" else None
	recommendation.technician_remarks = remarks
	recommendation.reviewed_by = frappe.session.user
	recommendation.reviewed_on = now_datetime()
	recommendation.flags.eola_review = True
	recommendation.save()
	alert.flags.eola_review = True
	alert.ai_recommendation = recommendation.name
	alert.technician_decision = decision
	alert.technician_remarks = remarks
	alert.status = "Dismissed" if decision == "Reject" else "Confirmed"
	alert.save()
	issue.flags.eola_review = True
	issue.ai_recommendation = recommendation.name
	issue.service_type = recommendation.recommended_type_of_service
	issue.status = "Dismissed" if decision == "Reject" else "Confirmed"
	issue.description = "\n\n".join([alert.evidence_summary or ""] + [f"{recommendation.meta.get_label(f)}:\n{recommendation.get(f) or ''}" for f in ("generated_on", "ai_model", "prompt_version", "input_summary", "finding", "possible_causes", "recommended_action", "recommended_type_of_service", "supporting_evidence", "confidence", "ai_disclaimer", "technician_decision", "technician_modification", "technician_remarks", "reviewed_by", "reviewed_on")])
	issue.save()
	return issue.name


@frappe.whitelist()
def dashboard():
	# get_list applies DocType and user permissions to every counter and card.
	systems = frappe.get_list("Installed Solar System", filters={"monitoring_status": "Monitoring"}, pluck="name", limit_page_length=0)
	alerts = frappe.get_list("Performance Alert", fields=["name", "alert_name", "severity", "deviation", "start_time", "end_time", "duration", "installed_solar_system", "alert_date", "status"], filters={"status": ["in", ["New Alert", "Under Review", "Confirmed"]]}, order_by="alert_date desc", limit_page_length=0)
	today_alerts = frappe.get_list("Performance Alert", filters={"alert_date": nowdate()}, pluck="name", limit_page_length=0)
	cases = frappe.get_list("ES Issue", filters={"status": ["in", ["Confirmed", "In Progress", "On Hold"]]}, pluck="name", limit_page_length=0)
	return dict(systems_monitored=len(systems), alerts_today=len(today_alerts), systems_needing_review=len({a.installed_solar_system for a in alerts if a.status in ("New Alert", "Under Review")}), maintenance_cases=len(cases), alerts=alerts[:50])


@frappe.whitelist(methods=["POST"])
def generate_recommendation(alert_name):
	"""The configured adapter returns structured output; no model is assumed."""
	lock("Performance Alert", alert_name)
	alert = writable("Performance Alert", alert_name)
	if alert.status not in ("New Alert", "Under Review"):
		frappe.throw("This alert has already received a technician decision.")
	if alert.ai_recommendation:
		return alert.ai_recommendation
	providers = frappe.get_hooks("eola_ai_provider")
	if len(providers) != 1:
		frappe.throw("Configure one eola_ai_provider hook to generate recommendations, or use Record AI Recommendation to record an external model's output.")
	context = recommendation_context(alert.name)
	output = frappe.get_attr(providers[0])(context)
	if not isinstance(output, dict):
		frappe.throw("The AI provider must return structured recommendation fields.")
	required = ("ai_model", "prompt_version", "finding", "recommended_action", "recommended_type_of_service")
	if any(not isinstance(output.get(key), str) or not output[key].strip() for key in required):
		frappe.throw("The AI provider omitted required recommendation fields.")
	if output["recommended_type_of_service"] not in ("Remote Work", "Site Service"):
		frappe.throw("The AI provider returned an unsupported service type.")
	allowed = (*required, "possible_causes", "supporting_evidence", "confidence")
	doc = frappe.get_doc(dict(doctype="AI Recommendation", recommendation_name=alert.alert_name,
		performance_alert=alert.name, generated_on=now_datetime(), input_summary=json.dumps(context, default=str, indent=2),
		**{key: output[key] for key in allowed if key in output})).insert()
	return doc.name
