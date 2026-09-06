"""Explicit, one-time sample inventory setup. Never run from install/migrate hooks."""
import json
from pathlib import Path

import frappe
from frappe.utils import escape_html, today

from eola.inventory import stock_balances

BATCH = 'EOLA-SIMULATION-2026-09'


def populate():
    frappe.only_for('System Manager')
    rows = json.loads((Path(__file__).parent / 'data/catalog_simulation_2026_09.json').read_text())
    with frappe.cache.lock(BATCH, timeout=120):
        items = {r.name: r for r in frappe.get_all('ES Item', fields=['name', 'model'])}
        if set(items) != {r['item'] for r in rows}:
            frappe.throw('Catalog changed; review the simulation dataset before running.')
        for row in rows:
            if (items[row['item']].model or '') != row['expected_model']:
                frappe.throw(f"Model changed for {row['item']}; review the simulation dataset.")
        if frappe.db.count('ES Item Price') or frappe.db.count('ES Stock Entry'):
            frappe.throw('Prices or stock entries already exist. No data was changed; this setup requires empty tables.')
        for row in rows:
            price = frappe.get_doc(dict(doctype='ES Item Price', item=row['item'], rate=row['rate'])).insert()
            price.add_comment('Comment', text=escape_html(
                f"{BATCH} | ESTIMATED PHP UNIT PRICE | Researched 2026-09-05. "
                f"{row['basis']} Source: {row['source']} "
                'Equipment only; installation and delivery excluded. Tax treatment and actual supplier selling price require confirmation.'))
            receipt_qty = row['stock'] or 5
            for kind, quantity in [('Receipt', receipt_qty), ('Issue', receipt_qty if not row['stock'] else 0)]:
                if not quantity:
                    continue
                entry = frappe.get_doc(dict(doctype='ES Stock Entry', item=row['item'],
                    posting_date=today(), entry_type=kind, quantity=quantity,
                    notes=f'{BATCH}: SIMULATED stock for inquiry testing, not a physical movement. Target balance: {row["stock"]}.'))
                entry.insert()
                entry.submit()
        balances = stock_balances()
        for row in rows:
            if balances.get(row['item'], 0) != row['stock']:
                frappe.throw(f"Unexpected stock balance for {row['item']}; rolling back.")
        return {'prices_created': len(rows), 'submitted_stock_entries': frappe.db.count('ES Stock Entry', {'docstatus': 1}),
                'in_stock_items': sum(r['stock'] > 0 for r in rows),
                'zero_stock_items': [r['item'] for r in rows if not r['stock']],
                'stock_range': [min(r['stock'] for r in rows), max(r['stock'] for r in rows)]}


def verify():
    """Read-only check of persisted prices, balances, and recommendation mapping."""
    from eola.inventory import available_catalog
    from eola.solar_sizing import estimate
    from eola.quotation import equipment_from_plan

    rows = json.loads((Path(__file__).parent / 'data/catalog_simulation_2026_09.json').read_text())
    prices = {r.item: float(r.rate) for r in frappe.get_all('ES Item Price', fields=['item', 'rate'])}
    balances = stock_balances()
    for row in rows:
        if prices.get(row['item']) != row['rate'] or balances.get(row['item'], 0) != row['stock']:
            frappe.throw(f"Persisted price/stock mismatch for {row['item']}.")
    catalog = available_catalog(frappe.get_all('EOLA Equipment Specification', filters={'active': 1},
        fields=['item', 'equipment_type', 'rated_power', 'rated_ac_output', 'nominal_capacity']))
    plan = estimate(dict(monthly_bill=6000, allocated_budget=400000, electricity_rate=12,
                        desired_reduction=50, roof_shading='None', grid_connection='Connected', backup_required=1), catalog)
    equipment = equipment_from_plan(plan)
    for row in equipment:
        if row['rate'] != prices[row['item']] or row['quantity'] > balances.get(row['item'], 0):
            frappe.throw('Recommendation stock or price mismatch.')
    return {'verified_prices': len(prices), 'verified_stock_balances': len(rows),
            'sample_recommended_items': [{key: row[key] for key in ('item', 'quantity', 'rate')} for row in equipment]}
