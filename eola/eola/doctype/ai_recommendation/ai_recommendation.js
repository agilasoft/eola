frappe.ui.form.on("AI Recommendation", {
	refresh(frm) {
		if (frm.is_new() || frm.doc.technician_decision !== "Pending") return;
		for (const decision of ["Accept", "Modify", "Reject"]) {
			frm.add_custom_button(__(decision), () => {
				frappe.prompt(
					[
						{
							fieldname: "modification",
							label: __("Modified Action"),
							fieldtype: "Long Text",
							reqd: decision === "Modify",
							hidden: decision !== "Modify",
						},
						{
							fieldname: "remarks",
							label: __("Technician Remarks"),
							fieldtype: "Long Text",
							reqd: decision === "Reject",
						},
					],
					async (values) => {
						const result = await frappe.call({
							method: "eola.api.review_recommendation",
							args: { name: frm.doc.name, decision, ...values },
							freeze: true,
						});
						frappe.set_route("Form", "ES Issue", result.message);
					},
					__("Review Recommendation"),
					__("Confirm")
				);
			});
		}
	},
});
