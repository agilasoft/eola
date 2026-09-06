"""Reproducible preliminary sizing. Constants are disclosed assumptions, not quotations."""
import math


def estimate(inquiry, catalog=()):
    bill = float(inquiry['monthly_bill'])
    budget = float(inquiry['allocated_budget'])
    rate = float(inquiry['electricity_rate'])
    reduction = float(inquiry['desired_reduction'])
    offgrid = inquiry.get('grid_connection') == 'No grid connection'
    system_type = 'Off-Grid' if offgrid else 'Hybrid' if inquiry.get('backup_required') else 'Grid-Tied'
    storage = system_type != 'Grid-Tied'
    shade = {'None': 1, 'Light': .9, 'Moderate': .75, 'Heavy': .5}.get(inquiry.get('roof_shading'), .8)
    sun_hours, performance, utilization = 4.5, .8, (.85 if storage else .7)
    monthly_yield = sun_hours * performance * shade * 30
    target_savings = bill * reduction / 100
    target_kwh = target_savings / rate
    target_kw = target_kwh / (monthly_yield * utilization)
    # Off-grid must cover the whole modeled load, even when the savings goal is lower.
    if offgrid:
        target_kw = bill / rate / (monthly_yield * utilization)
    battery_kwh = max(5.12, math.ceil((bill / rate / 30 if offgrid else target_kwh / 30 * .5) / .8 / 5.12) * 5.12) if storage else 0
    battery_cost = battery_kwh * 14000
    fixed_cost = 25000 + (30000 if storage else 0) + battery_cost
    kw_cost = 45000
    affordable_kw = max(0, (budget - fixed_cost) / kw_cost)
    panel_wp = 550
    target_panels = max(2, math.ceil(target_kw / (panel_wp / 1000)))
    target_cost = fixed_cost + target_panels * .55 * kw_cost
    target_battery_kwh = battery_kwh
    # Start with a smaller battery for a budget-constrained hybrid proposal.
    if storage and not offgrid and budget < target_cost:
        battery_kwh = 5.12
        fixed_cost = 25000 + 30000 + battery_kwh * 14000
        affordable_kw = max(0, (budget - fixed_cost) / kw_cost)
    # Keep the minimum modeled array even when it exceeds the customer's budget.
    # An off-grid proposal retains the full modeled load and storage requirement.
    panels = target_panels if offgrid else max(2, min(target_panels, math.floor(affordable_kw / (panel_wp / 1000))))
    roof_area = float(inquiry.get('roof_area') or 0)
    area_per_panel = 3.0  # Disclosed planning allowance, including spacing.
    roof_limit = math.floor(roof_area / area_per_panel) if roof_area else None
    roof_limited = roof_limit is not None and roof_limit < panels
    if roof_limited:
        panels = roof_limit if roof_limit >= 2 else 0
    kw = panels * panel_wp / 1000
    inverter_kw = next((v for v in [1.5, 3, 5, 6, 8, 10, 15, 20, 30, 50, 100] if v >= kw), math.ceil(kw)) if panels else 0
    generated = kw * monthly_yield
    savings = min(bill, generated * utilization * rate)
    cost = fixed_cost + kw * kw_cost if panels else 0
    warnings = ['Preliminary design only. An installer must verify roof area/structure, electrical loads, string voltage/current, inverter and battery compatibility, local yield, tariff and installation quote.',
                'Export credits are excluded. Fixed utility charges may remain. Generation is not the same as electricity consumed on site.',
                'Equipment prices and solar resource values below are planning assumptions, not live market prices or a site survey.']
    if roof_limited:
        warnings.append('Usable roof area limits the proposed panel count. Consider another installation area if the energy target cannot be met.')
    if not panels:
        warnings.append('The entered roof area cannot fit the minimum two-panel modeled array. An installer must assess alternative layouts or locations.')
    if not roof_area:
        warnings.append('Usable roof area was not provided; panel fit requires site assessment.')
    if offgrid:
        warnings.append('Off-grid autonomy and peak loads require a load survey; this estimate does not guarantee continuous supply. The monthly bill is used as a proxy for full energy demand.')
    if savings + .01 < target_savings or (offgrid and panels < target_panels):
        warnings.append('The allocated budget does not meet the modeled energy goal. Increase the budget or revise the target; do not disconnect from the grid on this basis.')
    if cost > budget:
        warnings.append(f'The proposed setup exceeds your budget by PHP {cost - budget:,.2f}. This is a preliminary planning option; pricing and suitability need installer confirmation.')
    if battery_kwh < target_battery_kwh:
        warnings.append('The smaller battery reduces backup duration compared with the target setup.')
    if inquiry.get('ownership_status') == 'Tenant':
        warnings.append('Property owner approval is needed before installation.')
    if float(inquiry.get('roof_age') or 0) >= 20:
        warnings.append('Arrange a roof condition assessment before selecting equipment.')
    def equipment(kind, rating, rating_field, description, quantity):
        matches = [c for c in catalog if c.get('equipment_type') == kind and float(c.get(rating_field) or 0) == rating and float(c.get('available_stock') or 0) >= quantity]
        # Catalog models are candidates, never a claim of verified system compatibility.
        candidates = [{'item': c['item'], 'model': c.get('model') or c.get('specification_name'), 'manufacturer': c.get('manufacturer'), 'rate': c.get('rate', 0), 'description': c.get('description') or c.get('item_name') or c['item']} for c in matches[:3]]
        if not candidates:
            warnings.append(f'No matching {kind} has enough stock for {quantity:g} units. This requirement is omitted from recommended items.')
        if not candidates:
            return None
        return dict(type=kind, specification=candidates[0]['description'], quantity=quantity, catalog_candidates=candidates,
                    selected_item=candidates[0] if candidates else None,
                    model_status='Catalog candidate; installer approval required' if candidates else 'No matching item with sufficient stock; installer review required')
    equipment_list = []
    if panels:
        equipment_list = [equipment('PV Module', panel_wp, 'rated_power', '550 Wp monocrystalline PV module', panels),
                          equipment('Inverter', inverter_kw, 'rated_ac_output', f'{inverter_kw:g} kW {system_type.lower()} inverter', 1)]
        if storage:
            equipment_list.append(equipment('Battery', 5.12, 'nominal_capacity', '5.12 kWh LiFePO4 battery; compatible BMS required', round(battery_kwh / 5.12)))
        equipment_list = [row for row in equipment_list if row]
        warnings.append('Installation materials and any unavailable equipment require a separate review; only available catalog items are listed.')
    return dict(system_type=system_type, pv_kwp=round(kw, 2), panel_count=panels, inverter_kw=inverter_kw,
                battery_kwh=round(battery_kwh, 2) if panels else 0, daily_kwh=round(generated / 30, 2),
                monthly_kwh=round(generated, 2), annual_kwh=round(generated * 12, 2),
                monthly_savings=round(savings, 2), remaining_bill=round(bill-savings, 2),
                achieved_reduction=round(savings/bill*100, 1), desired_reduction=reduction,
                target_monthly_kwh=round(target_kwh, 2), estimated_cost=round(cost, 2), budget=budget,
                target_cost=round(target_cost, 2), budget_shortfall=round(max(0, cost - budget), 2), within_budget=cost <= budget,
                target_met=panels >= target_panels and battery_kwh >= target_battery_kwh, equipment=equipment_list, warnings=warnings,
                assumptions=dict(usable_roof_area_m2=roof_area or None, area_per_panel_m2=area_per_panel, currency='PHP', electricity_rate=rate, peak_sun_hours=sun_hours,
                    performance_ratio=performance, shading_factor=shade, self_consumption=utilization,
                    installed_pv_cost_per_kwp=kw_cost, base_installation_cost=25000,
                    storage_inverter_allowance=30000 if storage else 0, battery_cost_per_kwh=14000,
                    battery_usable_fraction=.8, days_per_month=30))
