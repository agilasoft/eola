import frappe


def ensure_roles():
	if not frappe.db.exists("Role", "EOLA Technician"):
		frappe.get_doc({"doctype": "Role", "role_name": "EOLA Technician", "desk_access": 1}).insert(ignore_permissions=True)


def ensure_indexes():
	frappe.db.add_unique("Telemetry", ["installed_solar_system", "telemetry_date"], constraint_name="unique_system_telemetry_date")
