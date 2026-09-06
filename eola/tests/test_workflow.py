"""Exercise review transitions without a live database or external AI service."""
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

try:
	import frappe
	from eola import api
	from eola.controllers import ESIssue
except ImportError:
	frappe = None


class Record(SimpleNamespace):
	def get(self, key):
		return getattr(self, key, None)

	def check_permission(self, permission):
		if getattr(self, "denied", False):
			raise PermissionError(permission)

	def reload(self):
		self.reloaded = True

	def save(self):
		self.saved = True


@unittest.skipIf(frappe is None, "Run with the bench Python environment to test Frappe workflow methods.")
class TestWorkflow(unittest.TestCase):
	def setUp(self):
		self.recommendation = Record(name="AI-1", performance_alert="ALT-1", technician_decision="Pending", flags=Record(), recommended_type_of_service="Site Service", recommended_action="Inspect inverter", meta=Record(get_label=lambda field: field))
		self.alert = Record(name="ALT-1", status="Under Review", resolution_issue="ISS-1", evidence_summary="Measured deficit", flags=Record())
		self.issue = Record(name="ISS-1", status="New Alert", flags=Record())
		self.docs = {"AI Recommendation": self.recommendation, "Performance Alert": self.alert, "ES Issue": self.issue}
		for mock in (
			patch.object(api, "lock"),
			patch.object(api, "now_datetime", return_value="2026-09-05 12:00:00"),
			patch("eola.controllers.nowdate", return_value="2026-09-05"),
			patch.object(api.frappe, "get_doc", side_effect=lambda dt, name: self.docs[dt]),
			patch.object(api.frappe, "throw", side_effect=lambda message: (_ for _ in ()).throw(ValueError(message))),
			patch.object(api.frappe, "session", Record(user="technician@example.com")),
		):
			mock.start()
			self.addCleanup(mock.stop)

	def test_accept_confirms_existing_case_and_records_reviewer(self):
		self.assertEqual(api.review_recommendation("AI-1", "Accept"), "ISS-1")
		self.assertEqual(self.issue.status, "Confirmed")
		self.assertEqual(self.alert.technician_decision, "Accept")
		self.assertEqual(self.recommendation.reviewed_by, "technician@example.com")
		self.assertIn("Inspect inverter", self.issue.description)
		self.assertTrue(self.recommendation.flags.eola_review)

	def test_modify_requires_action_and_preserves_it(self):
		with self.assertRaises(ValueError):
			api.review_recommendation("AI-1", "Modify", " ")
		api.review_recommendation("AI-1", "Modify", "Check remotely first")
		self.assertIn("Check remotely first", self.issue.description)
		self.assertEqual(self.issue.status, "Confirmed")
		self.assertTrue(self.alert.reloaded)
		self.assertTrue(self.issue.reloaded)

	def test_reject_requires_reason_and_dismisses(self):
		with self.assertRaises(ValueError):
			api.review_recommendation("AI-1", "Reject")
		api.review_recommendation("AI-1", "Reject", remarks="Known planned shutdown")
		self.assertEqual(self.issue.status, "Dismissed")
		self.assertEqual(self.alert.status, "Dismissed")

	def test_repeated_review_is_rejected(self):
		api.review_recommendation("AI-1", "Accept")
		with self.assertRaises(ValueError):
			api.review_recommendation("AI-1", "Reject", remarks="Change of mind")

	def test_permission_is_required_before_mutation(self):
		self.issue.denied = True
		with self.assertRaises(PermissionError):
			api.review_recommendation("AI-1", "Accept")
		self.assertEqual(self.recommendation.technician_decision, "Pending")

	def test_finalized_alert_cannot_review_another_recommendation(self):
		self.alert.status = "Resolved"
		with self.assertRaises(ValueError):
			api.review_recommendation("AI-1", "Accept")

	def test_issue_cannot_bypass_review(self):
		previous = Record(status="New Alert", performance_alert="ALT-1")
		issue = Record(status="Confirmed", performance_alert="ALT-1", flags=Record(eola_review=False), get_doc_before_save=lambda: previous)
		with self.assertRaisesRegex(ValueError, "transition"):
			ESIssue.validate(issue)

	def test_resolution_requires_details_and_sets_date(self):
		previous = Record(status="In Progress", performance_alert=None)
		issue = Record(status="Resolved", performance_alert=None, flags=Record(eola_review=False), resolution=None, get_doc_before_save=lambda: previous)
		with self.assertRaisesRegex(ValueError, "resolution details"):
			ESIssue.validate(issue)
		issue.resolution = "Replaced failed connector"
		ESIssue.validate(issue)
		self.assertIsNotNone(issue.resolved_date)

	def test_new_case_does_not_overwrite_alert_review_state(self):
		with patch.object(api.frappe, "db", new=Mock()) as database:
			ESIssue.on_update(Record(performance_alert="ALT-1", status="New Alert"))
			database.set_value.assert_not_called()

	def test_resolved_case_resolves_alert(self):
		with patch.object(api.frappe, "db", new=Mock()) as database:
			database.get_value.return_value = "Confirmed"
			ESIssue.on_update(Record(performance_alert="ALT-1", status="Resolved"))
			database.set_value.assert_called_once_with("Performance Alert", "ALT-1", "status", "Resolved")

	def test_approval_does_not_resolve_alert(self):
		api.review_recommendation("AI-1", "Accept")
		self.assertEqual(self.alert.status, "Confirmed")
		self.assertEqual(self.issue.status, "Confirmed")

	def test_schedule_and_reschedule_require_details(self):
		self.alert.installed_solar_system = "SYS-1"
		self.alert.technician_decision = "Accept"
		previous = Record(status="Confirmed", performance_alert="ALT-1", installed_solar_system="SYS-1")
		issue = Record(status="Scheduled", performance_alert="ALT-1", installed_solar_system="SYS-1", flags=Record(eola_review=False), get_doc_before_save=lambda: previous)
		with self.assertRaisesRegex(ValueError, "scheduled date"):
			ESIssue.validate(issue)
		issue.scheduled_date = "2026-09-10"
		ESIssue.validate(issue)
		self.assertIsNone(issue.resolved_date)
		previous.status = "Scheduled"
		issue.status = "Re-scheduled"
		with self.assertRaisesRegex(ValueError, "reason"):
			ESIssue.validate(issue)
		issue.reschedule_reason = "Customer requested another day"
		issue.scheduled_date = "2026-09-11"
		ESIssue.validate(issue)
		self.assertIsNone(issue.resolved_date)

	def test_scheduled_case_keeps_alert_pending_service(self):
		for status in ("Scheduled", "Re-scheduled", "In Progress", "On Hold"):
			with self.subTest(status=status), patch.object(api.frappe, "db", new=Mock()) as database:
				database.get_value.return_value = "Confirmed"
				ESIssue.on_update(Record(performance_alert="ALT-1", status=status))
				database.set_value.assert_not_called()

	def test_dashboard_links_issues_and_counts_active_cases(self):
		statuses = ["New Alert", "Confirmed", "Scheduled", "Re-scheduled", "In Progress", "On Hold", "Resolved", "Dismissed"]
		issues = [Record(name=f"ISS-{i}", status=status) for i, status in enumerate(statuses)]
		alert = Record(name="ALT-1", status="Confirmed", installed_solar_system="SYS-1", ai_recommendation=None, resolution_issue="ISS-2")
		with patch.object(api.frappe, "get_list", side_effect=[["SYS-1"], [alert], ["ALT-1"], issues]), patch.object(api.frappe, "has_permission", return_value=True), patch.object(api, "nowdate", return_value="2026-09-05"):
			result = api.dashboard()
		self.assertEqual(result["maintenance_cases"], 5)
		self.assertEqual(result["systems_needing_review"], 0)
		self.assertEqual(result["issues"], issues)
		self.assertEqual(result["alerts"][0].issue.status, "Scheduled")
		self.assertFalse(result["alerts"][0].can_review)
