frappe.pages["eola-dashboard"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __("EOLA — Energy Optimization & Lifecycle"),
		single_column: true,
	});
	const body = $('<div class="eola-dashboard" style="padding:24px"></div>').appendTo(page.main);
	const refresh = async () => {
		body.empty().append($("<p>").text(__("Loading solar performance…")));
		try {
			const { message: data } = await frappe.call("eola.api.dashboard");
			body.empty();
			const metrics = $(
				'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:32px"></div>'
			).appendTo(body);
			for (const [label, value] of [
				["Systems Monitored", data.systems_monitored],
				["Alerts Today", data.alerts_today],
				["Systems Needing Review", data.systems_needing_review],
				["Maintenance Cases", data.maintenance_cases],
			]) {
				const card = $(
					'<div style="padding:20px;border:1px solid var(--border-color);border-radius:12px;background:var(--card-bg)"></div>'
				).appendTo(metrics);
				$("<div>").text(__(label)).appendTo(card);
				$('<strong style="font-size:32px"></strong>').text(value).appendTo(card);
			}
			$("<h3>").text(__("Performance Alerts")).appendTo(body);
			if (!data.alerts.length)
				$("<p>").text(__("No open performance alerts.")).appendTo(body);
			for (const alert of data.alerts) {
				const card = $(
					'<div style="padding:20px;margin:12px 0;border:1px solid var(--border-color);border-radius:12px"></div>'
				).appendTo(body);
				$("<h4>").text(alert.alert_name).appendTo(card);
				$("<p>")
					.text(
						`${alert.severity} · ${alert.alert_date} · ${Number(
							alert.deviation
						).toFixed(1)}% vs expected · ${
							Number(alert.duration) / 3600
						} affected hours · ${alert.status}`
					)
					.appendTo(card);
				$('<button class="btn btn-primary btn-sm"></button>')
					.text(__("Review Alert"))
					.on("click", () => frappe.set_route("Form", "Performance Alert", alert.name))
					.appendTo(card);
			}
		} catch (error) {
			body.empty().append(
				$("<p>").text(
					__("Unable to load dashboard. Check your permissions and try again.")
				)
			);
		}
	};
	page.set_primary_action(__("Refresh"), refresh);
	wrapper.eola_refresh = refresh;
};
frappe.pages["eola-dashboard"].on_page_show = (wrapper) => wrapper.eola_refresh();
