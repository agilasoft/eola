frappe.ui.form.on("Customer Lead", {
	refresh(frm) {
		if (frm.is_new()) return;
		frm.add_custom_button(__("Solar Recommendation"), () => {
			const generate = async () => {
				if (frm.is_dirty()) await frm.save();
				await frappe.call({ method: "eola.customer_inquiry.generate_inquiry_recommendation", args: { name: frm.doc.name }, freeze: true, freeze_message: __("Preparing solar recommendation…") });
				await frm.reload_doc();
			};
			if ((frm.doc.recommended_equipment || []).length) {
				frappe.confirm(__("Regenerate the recommendation and replace the equipment table, including any edits?"), generate);
			} else {
				generate();
			}
		});
		if (frappe.model.can_create("ES Quotation")) {
			frm.add_custom_button(__("Create Quotation"), async () => {
				if (frm.is_dirty()) await frm.save();
				const response = await frappe.call({ method: "eola.quotation.create_quotation", args: { name: frm.doc.name }, freeze: true, freeze_message: __("Preparing quotation…") });
				const [quotation] = frappe.model.sync(response.message);
				frappe.set_route("Form", quotation.doctype, quotation.name);
			});
		}
	}
});

frappe.ui.form.on("ES Quotation Item", {
	quantity(frm, cdt, cdn) { update_lead_equipment_amount(frm, cdt, cdn); },
	rate(frm, cdt, cdn) { update_lead_equipment_amount(frm, cdt, cdn); }
});

function update_lead_equipment_amount(frm, cdt, cdn) {
	if (frm.doctype !== "Customer Lead") return;
	const row = locals[cdt][cdn];
	frappe.model.set_value(cdt, cdn, "amount", Math.round(flt(row.quantity) * flt(row.rate) * 100) / 100);
}

frappe.ui.form.on("ES Quotation Item", {
    async item(frm, cdt, cdn) {
        if (frm.doctype !== "Customer Lead") return;
        const row = locals[cdt][cdn];
        const item = row.item;
        if (!item) return frappe.model.set_value(cdt, cdn, "rate", 0);
        const response = await frappe.call({method: "eola.inventory.get_item_rate", args: {item}});
        if (locals[cdt]?.[cdn]?.item === item) {
            await frappe.model.set_value(cdt, cdn, "rate", response.message || 0);
        }
    }
});
