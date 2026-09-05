frappe.ui.form.on("Telemetry", {
	refresh(frm) {
		if (!frm.is_new() && frm.doc.analysis_status !== "Analyzed") {
			frm.add_custom_button(__("Analyze Telemetry"), async () => {
				if (frm.is_dirty()) await frm.save();
				await frappe.call({
					method: "eola.api.analyze_telemetry",
					args: { name: frm.doc.name },
					freeze: true,
				});
				await frm.reload_doc();
			});
		}
		if (!frm.doc.readings?.length) {
			frm.add_custom_button(__("Add 24 Hourly Rows"), () => {
				for (let hour = 0; hour < 24; hour++) {
					frm.add_child("readings", {
						reading_time: `${String(hour).padStart(2, "0")}:00:00`,
					});
				}
				frm.refresh_field("readings");
				frm.dirty();
			});
		}
	},
	setup(frm) {
		frm.set_query("monitoring_device", () => ({
			filters: { installed_solar_system: frm.doc.installed_solar_system },
		}));
		frm.set_query("installed_equipment", "equipment", () => ({
			filters: { installed_solar_system: frm.doc.installed_solar_system },
		}));
	},
});
