frappe.ui.form.on("Performance Alert", {
	async refresh(frm) {
		if (frm.is_new()) return;
		frm.add_custom_button(__("Generate AI Recommendation"), async () => {
			const { message } = await frappe.call({
				method: "eola.api.generate_recommendation",
				args: { alert_name: frm.doc.name },
				freeze: true,
			});
			frappe.set_route("Form", "AI Recommendation", message);
		});
		frm.add_custom_button(__("Recommendations"), () =>
			frappe.set_route("List", "AI Recommendation", { performance_alert: frm.doc.name })
		);
		frm.add_custom_button(__("Record AI Recommendation"), async () => {
			const { message } = await frappe.call({
				method: "eola.api.recommendation_context",
				args: { alert_name: frm.doc.name },
			});
			frappe.new_doc("AI Recommendation", {
				performance_alert: frm.doc.name,
				recommendation_name: frm.doc.alert_name,
				generated_on: frappe.datetime.now_datetime(),
				input_summary: JSON.stringify(message, null, 2),
			});
		});
		if (frm.doc.resolution_issue)
			frm.add_custom_button(__("Service Case"), () =>
				frappe.set_route("Form", "ES Issue", frm.doc.resolution_issue)
			);
		if (frm.doc.telemetry) {
			const telemetry = await frappe.db.get_doc("Telemetry", frm.doc.telemetry);
			const readings = [...telemetry.readings].sort((a, b) =>
				a.reading_time.localeCompare(b.reading_time)
			);
			const wrapper = frm.fields_dict.telemetry_chart.$wrapper.empty();
			new frappe.Chart(wrapper[0], {
				type: "line",
				height: 260,
				colors: ["#2563eb", "#94a3b8"],
				data: {
					labels: readings.map((r) => r.reading_time.slice(0, 5)),
					datasets: [
						{ name: __("Actual kW"), values: readings.map((r) => r.ac_power) },
						{ name: __("Expected kW"), values: readings.map((r) => r.expected_power) },
					],
				},
			});
		}
	},
});
