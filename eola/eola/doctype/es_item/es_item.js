frappe.ui.form.on('ES Item', {
    refresh(frm) {
        if (frm.is_new()) return;
        frm.add_custom_button(__('Item Price'), () => {
            frappe.set_route('List', 'ES Item Price', { item: frm.doc.name });
        });
        frm.add_custom_button(__('Stock Entries'), () => {
            frappe.set_route('List', 'ES Stock Entry', { item: frm.doc.name });
        });
    }
});
