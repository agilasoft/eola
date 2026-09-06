frappe.ui.form.on("ES Quotation", {
	validate(frm) { update_quotation_amounts(frm); }
});

function update_quotation_amounts(frm) {
	if (frm.doctype !== "ES Quotation") return;
	let total = 0;
	for (const row of frm.doc.items || []) {
		row.amount = Math.round(flt(row.quantity) * flt(row.rate) * 100) / 100;
		total += row.amount;
	}
	frm.set_value("total", total);
	frm.refresh_field("items");
}

frappe.ui.form.on("ES Quotation Item", {
	quantity(frm) { update_quotation_amounts(frm); },
	rate(frm) { update_quotation_amounts(frm); },
	items_remove(frm) { update_quotation_amounts(frm); }
});

frappe.ui.form.on("ES Quotation Item", {
    async item(frm, cdt, cdn) {
        if (frm.doctype !== "ES Quotation") return;
        const row = locals[cdt][cdn];
        const item = row.item;
        if (!item) return frappe.model.set_value(cdt, cdn, "rate", 0);
        const response = await frappe.call({method: "eola.inventory.get_item_rate", args: {item}});
        if (locals[cdt]?.[cdn]?.item === item) {
            await frappe.model.set_value(cdt, cdn, "rate", response.message || 0);
        }
    }
});
