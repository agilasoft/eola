"""Stock balances from submitted movements and current PHP selling prices."""
import frappe


def stock_balances():
    rows = frappe.db.sql("""
        SELECT item, SUM(CASE WHEN entry_type = 'Receipt' THEN quantity ELSE -quantity END) AS quantity
        FROM `tabES Stock Entry` WHERE docstatus = 1 GROUP BY item
    """, as_dict=True)
    return {row.item: float(row.quantity or 0) for row in rows}


def available_catalog(catalog):
    items = {row.name: row for row in frappe.get_all('ES Item', filters={'disabled': 0},
        fields=['name', 'item_name', 'description', 'manufacturer', 'model'])}
    balances = stock_balances()
    prices = {row.item: row.rate for row in frappe.get_all(
        'ES Item Price', filters={'disabled': 0}, fields=['item', 'rate'])}
    return [dict(row, item_name=items[row['item']].item_name,
                 description=items[row['item']].description or items[row['item']].item_name,
                 manufacturer=items[row['item']].manufacturer, model=items[row['item']].model, available_stock=balances.get(row['item'], 0), rate=prices.get(row['item'], 0))
            for row in catalog if row['item'] in items and balances.get(row['item'], 0) > 0]


def fill_missing_rates(rows):
    """Fill unpriced item rows while retaining negotiated nonzero rates."""
    missing = [row for row in rows if row.get('item') and not row.get('rate')]
    if not missing:
        return
    prices = {row.item: row.rate for row in frappe.get_all('ES Item Price',
        filters={'disabled': 0, 'item': ['in', list({row.get('item') for row in missing})]},
        fields=['item', 'rate'])}
    for row in missing:
        if row.get('item') in prices:
            row.update({'rate': prices[row.get('item')]})


@frappe.whitelist()
def get_item_rate(item):
    frappe.has_permission('ES Item Price', 'read', throw=True)
    return frappe.db.get_value('ES Item Price', {'item': item, 'disabled': 0}, 'rate') or 0
