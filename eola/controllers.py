"""Shared validation for EOLA business records."""
import frappe
from frappe.model.document import Document
from frappe.utils import getdate, nowdate

from eola.analysis import hourly_map, power


def same_system(equipment, system):
	if equipment and frappe.db.get_value("Installed Equipment", equipment, "installed_solar_system") != system:
		frappe.throw("Equipment must belong to the selected solar system.")


class InstalledEquipment(Document):
	def validate(self):
		if self.warranty_start and self.warranty_end and getdate(self.warranty_end) < getdate(self.warranty_start):
			frappe.throw("Warranty End cannot precede Warranty Start.")
		if self.equipment_specification:
			spec = frappe.get_doc("EOLA Equipment Specification", self.equipment_specification)
			if spec.item != self.item or spec.equipment_type != self.equipment_type:
				frappe.throw("Equipment item and type must match its specification.")


class PerformanceBaseline(Document):
	def validate(self):
		same_system(self.equipment, self.installed_solar_system)
		if self.effective_to and getdate(self.effective_to) < getdate(self.effective_from):
			frappe.throw("Effective To cannot precede Effective From.")
		try:
			hourly_map(self.hours, "hour")
			for row in self.hours:
				power(row.expected_power)
				power(row.minimum_expected_power)
				power(row.maximum_expected_power)
				if row.maximum_expected_power and not row.minimum_expected_power <= row.expected_power <= row.maximum_expected_power:
					raise ValueError("Expected power must fall within the minimum and maximum bounds.")
				row.expected_energy = row.expected_power
		except ValueError as exc:
			frappe.throw(str(exc))


class Telemetry(Document):
	def validate(self):
		previous = self.get_doc_before_save()
		if previous and previous.analysis_status == "Analyzed" and not self.flags.eola_analysis:
			frappe.throw("Analyzed telemetry is immutable to preserve its evidence trail.")
		if not self.flags.eola_analysis:
			self.analysis_status = "Pending"
			self.performance_status = "Not Analyzed"
			self.performance_alert = None
			self.anomaly_detected = 0
			self.analysis_summary = None
			for field in ("daily_energy_production", "expected_daily_energy", "performance_deviation", "maximum_output", "average_daytime_output"):
				setattr(self, field, 0)
			for row in self.readings:
				row.expected_power = row.power_deviation = 0
				row.reading_status = None
		self.customer = frappe.db.get_value("Installed Solar System", self.installed_solar_system, "customer")
		customer_name = frappe.db.get_value("ES Customer", self.customer, "customer_name")
		self.display_name = f"{customer_name} — {self.telemetry_date} — {self.installed_solar_system}"
		self.reading_count = len(self.readings)
		same_system(self.monitoring_device, self.installed_solar_system)
		seen = set()
		for row in self.equipment:
			same_system(row.installed_equipment, self.installed_solar_system)
			if row.installed_equipment in seen:
				frappe.throw("Equipment cannot be listed twice.")
			seen.add(row.installed_equipment)
			unit = frappe.get_doc("Installed Equipment", row.installed_equipment)
			for field in ("equipment_type", "item", "manufacturer", "model", "serial_number"):
				setattr(row, field, unit.get(field))
		if frappe.db.exists("Telemetry", {"installed_solar_system": self.installed_solar_system, "telemetry_date": self.telemetry_date, "name": ["!=", self.name]}):
			frappe.throw("A telemetry document already exists for this system and date.")


class AIRecommendation(Document):
	def before_insert(self):
		frappe.db.get_value("Performance Alert", self.performance_alert, "name", for_update=True)

	def after_insert(self):
		alert = frappe.get_doc("Performance Alert", self.performance_alert)
		alert.check_permission("write")
		alert.ai_recommendation = self.name
		alert.status = "Under Review"
		alert.flags.eola_review = True
		alert.save()

	def validate(self):
		previous = self.get_doc_before_save()
		if previous and not self.flags.eola_review:
			frappe.throw("Recommendations are immutable audit records. Create a new recommendation instead.")
		if self.is_new():
			alert = frappe.get_doc("Performance Alert", self.performance_alert)
			alert.check_permission("read")
			if alert.status not in ("New Alert", "Under Review"):
				frappe.throw("Recommendations require an open alert awaiting review.")
			self.technician_decision = "Pending"
			self.reviewed_by = self.reviewed_on = None
			self.technician_modification = self.technician_remarks = None
		if not 0 <= (self.confidence or 0) <= 100:
			frappe.throw("Confidence must be between 0 and 100.")


class ESIssue(Document):
	def validate(self):
		previous = self.get_doc_before_save()
		if previous and not self.flags.eola_review:
			for field in ("performance_alert", "telemetry", "ai_recommendation", "installed_solar_system", "customer"):
				if self.get(field) != previous.get(field):
					frappe.throw("Service case traceability links cannot be changed.")
			if previous.performance_alert and previous.status != self.status:
				allowed = {
					"New Alert": set(), "Dismissed": set(),
					"Confirmed": {"In Progress", "On Hold", "Resolved"},
					"In Progress": {"On Hold", "Resolved"},
					"On Hold": {"In Progress", "Resolved"},
					"Resolved": {"Closed", "In Progress"},
					"Closed": {"In Progress"},
				}
				if self.status not in allowed.get(previous.status, set()):
					frappe.throw("This case status transition requires technician recommendation review or is not allowed.")
		if self.performance_alert:
			alert = frappe.get_doc("Performance Alert", self.performance_alert)
			if self.installed_solar_system != alert.installed_solar_system:
				frappe.throw("Issue and alert must belong to the same solar system.")
			if self.status not in ("New Alert", "Dismissed") and alert.technician_decision not in ("Accept", "Modify"):
				frappe.throw("A technician must accept or modify the recommendation before service begins.")
		if self.status in ("Resolved", "Closed"):
			if not self.resolution:
				frappe.throw("Enter resolution details before resolving the issue.")
			self.resolved_date = (previous.resolved_date if previous and previous.status in ("Resolved", "Closed") else None) or nowdate()
		else:
			self.resolved_date = None

	def on_update(self):
		if self.performance_alert and self.status != "New Alert":
			status = {"Resolved": "Resolved", "Closed": "Resolved", "Dismissed": "Dismissed"}.get(self.status, "Confirmed")
			if frappe.db.get_value("Performance Alert", self.performance_alert, "status") != status:
				frappe.db.set_value("Performance Alert", self.performance_alert, "status", status)


class ESMaintenanceVisit(Document):
	def validate(self):
		issue = frappe.get_doc("ES Issue", self.issue)
		if issue.status not in ("Confirmed", "In Progress", "On Hold"):
			frappe.throw("Maintenance visits require a confirmed, open service case.")
		if issue.installed_solar_system != self.installed_solar_system or issue.service_type != "Site Service":
			frappe.throw("A maintenance visit requires a Site Service issue for the same system.")
		if self.status == "Completed" and (not self.completed_date or not self.work_performed):
			frappe.throw("Completed visits require a completion date and work performed.")


class PerformanceAlert(Document):
	def validate(self):
		if not (self.flags.eola_analysis or self.flags.eola_review):
			frappe.throw("Performance alerts are managed through telemetry analysis and technician review.")
