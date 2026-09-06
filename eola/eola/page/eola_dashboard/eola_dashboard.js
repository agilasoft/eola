// frappe.pages["eola-dashboard"].on_page_load = function (wrapper) {
// 	const page = frappe.ui.make_app_page({ parent: wrapper, title: __("EOLA Dashboard"), single_column: true });
// 	const body = $('<div class="eola-review-dashboard"></div>').appendTo(page.main);
// 	$(`<style>
// 	.eola-review-dashboard { padding:20px; max-width:1280px; margin:0 auto; color:var(--text-color); }
// 	.eola-review-dashboard .eola-hero { background:linear-gradient(120deg,#102c36,#176c66); color:#fff; padding:26px; border-radius:16px; margin-bottom:22px; }
// 	.eola-review-dashboard .eola-eyebrow { text-transform:uppercase; letter-spacing:2px; font-size:11px; font-weight:700; opacity:.75; }
// 	.eola-review-dashboard .eola-hero h2 { color:#fff; margin:10px 0; font-size:28px; }
// 	.eola-review-dashboard .eola-hero p { margin:0; color:#d4e9e6; }
// 	.eola-review-dashboard .eola-metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin-bottom:30px; }
// 	.eola-review-dashboard .eola-metric { border:1px solid var(--border-color); background:var(--card-bg); padding:20px; border-radius:14px; }
// 	.eola-review-dashboard .eola-metric span { display:block; color:var(--text-muted); font-size:12px; }
// 	.eola-review-dashboard .eola-metric strong { display:block; font-size:30px; margin-top:6px; }
// 	.eola-review-dashboard .eola-section { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; gap:12px; flex-wrap:wrap; }
// 	.eola-review-dashboard .eola-section h3 { margin:0; }
// 	.eola-review-dashboard .eola-alert { background:var(--card-bg); border:1px solid var(--border-color); border-left:4px solid #d59628; border-radius:16px; margin-bottom:22px; overflow:hidden; box-shadow:0 5px 18px rgba(0,0,0,.035); }
// 	.eola-review-dashboard .eola-alert.critical { border-left-color:#d45757; }
// 	.eola-review-dashboard .eola-alert-head { padding:22px 24px 16px; }
// 	.eola-review-dashboard .eola-badges { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
// 	.eola-review-dashboard .eola-badge { padding:4px 10px; border-radius:20px; background:var(--control-bg); font-size:12px; font-weight:600; }
// 	.eola-review-dashboard .eola-severity { background:#fff0cb; color:#77500b; }
// 	.eola-review-dashboard .critical .eola-severity { background:#ffe4e4; color:#982f2f; }
// 	.eola-review-dashboard h4 { font-size:18px; margin:0 0 10px; line-height:1.4; }
// 	.eola-review-dashboard .eola-stats { display:flex; gap:20px; flex-wrap:wrap; color:var(--text-muted); font-size:13px; }
// 	.eola-review-dashboard .eola-finding { margin:14px 0 0; line-height:1.6; }
// 	.eola-review-dashboard .eola-columns { display:grid; grid-template-columns:1fr 1fr; gap:24px; padding:20px 24px; border-top:1px solid var(--border-color); }
// 	.eola-review-dashboard .eola-columns[hidden] { display:none; }
// 	.eola-review-dashboard .eola-columns h5 { font-size:12px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin:0 0 14px; }
// 	.eola-review-dashboard .eola-lines { white-space:pre-wrap; line-height:1.85; font-size:13px; overflow-wrap:anywhere; }
// 	.eola-review-dashboard .eola-footer { padding:16px 24px; background:var(--subtle-fg); display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; border-top:1px solid var(--border-color); }
// 	.eola-review-dashboard .eola-actions { display:flex; gap:8px; flex-wrap:wrap; }
// 	.eola-review-dashboard .eola-accept { background:#176c66; color:#fff; }
// 	.eola-review-dashboard .eola-accept:hover { background:#10524e; color:#fff; }
// 	.eola-review-dashboard .eola-reject { color:var(--red-600); }
// 	.eola-review-dashboard .eola-note { padding:0 24px 16px; color:var(--text-muted); font-size:12px; }
// 	.eola-review-dashboard .eola-empty { padding:32px; text-align:center; border:1px dashed var(--border-color); border-radius:14px; color:var(--text-muted); }
// 	@media(max-width:900px) { .eola-review-dashboard .eola-metrics { grid-template-columns:repeat(2,1fr); } .eola-review-dashboard .eola-columns { grid-template-columns:1fr; } }
// 	@media(max-width:540px) { .eola-review-dashboard { padding:12px; } .eola-review-dashboard .eola-hero { padding:22px; } .eola-review-dashboard .eola-alert-head,.eola-review-dashboard .eola-columns,.eola-review-dashboard .eola-footer { padding:16px; } }
// 	.eola-review-dashboard .eola-toolbar { display:grid; grid-template-columns:minmax(180px,2fr) repeat(3,minmax(140px,1fr)); gap:12px; padding:16px; background:var(--card-bg); border:1px solid var(--border-color); border-radius:12px; margin-bottom:16px; }
// 	.eola-review-dashboard .eola-toolbar label { display:block; font-size:12px; color:var(--text-muted); margin-bottom:6px; }
// 	.eola-review-dashboard .eola-toolbar .form-control { width:100%; min-height:38px; }
// 	.eola-review-dashboard .eola-details { margin-top:14px; }
// 	.eola-review-dashboard .btn { min-height:34px; }
// 	.eola-review-dashboard :is(button,input,select,a):focus-visible { outline:2px solid var(--primary); outline-offset:3px; }
// 	.eola-review-dashboard .eola-alert h4 { overflow-wrap:anywhere; }
// 	.eola-review-dashboard .eola-result-count { margin:0 0 16px; color:var(--text-muted); font-size:13px; }
// 	.eola-review-dashboard .eola-system { margin-bottom:10px; color:var(--text-muted); font-size:13px; }
// 	@media(max-width:900px) { .eola-review-dashboard .eola-toolbar { grid-template-columns:1fr 1fr; } }
// 	@media(max-width:540px) { .eola-review-dashboard .eola-toolbar { grid-template-columns:1fr; } .eola-review-dashboard .eola-metric { padding:14px; } }
// 	.eola-review-dashboard .eola-tabs { display:flex; gap:8px; border-bottom:1px solid var(--border-color); margin-bottom:20px; padding-bottom:8px; }
// 	.eola-review-dashboard .eola-tabs [aria-selected="true"] { background:#176c66; color:white; }
// 	.eola-review-dashboard [role="tabpanel"][hidden] { display:none; }
// 	.eola-review-dashboard button.eola-metric { text-align:left; cursor:pointer; width:100%; color:inherit; }
// 	.eola-review-dashboard .eola-issue-tools { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:16px; }
// 	.eola-review-dashboard .eola-issue-tools > label { flex:1; min-width:180px; }
// 	</style>`).appendTo(page.main);
// 	const text = (tag, value, parent, cls) => $(tag).addClass(cls || "").text(value || "").appendTo(parent);
// 	const button = (parent, label, handler, cls = "btn-default") => $('<button type="button" class="btn btn-sm"></button>').addClass(cls).text(__(label)).on("click", handler).appendTo(parent);
// 	const review = (alert, decision) => {
// 		const dialog = new frappe.ui.Dialog({
// 			title: __("{0} Recommendation", [decision]),
// 			fields: [
// 				{ fieldname: "modification", label: __("Modified Actions"), fieldtype: "Long Text", reqd: decision === "Modify", hidden: decision !== "Modify", default: decision === "Modify" ? alert.recommendation.recommended_action : "" },
// 				{ fieldname: "remarks", label: __("Technician Remarks"), fieldtype: "Long Text", reqd: decision === "Reject" },
// 			],
// 			primary_action_label: __("Confirm {0}", [decision]),
// 			async primary_action(values) {
// 				dialog.get_primary_btn().prop("disabled", true);
// 				try {
// 					await frappe.call({ method: "eola.api.review_recommendation", args: { name: alert.recommendation.name, decision, ...values }, freeze: true });
// 					dialog.hide();
// 					frappe.show_alert({ message: __("Review saved"), indicator: "green" });
// 					await refresh();
// 				} finally {
// 					dialog.get_primary_btn().prop("disabled", false);
// 				}
// 			},
// 		});
// 		dialog.show();
// 	};
// 	const filters = { search: "", severity: "", status: "", sort: "priority" };
// 	let activeTab = "alerts";
// 	const issueFilters = { search: "", status: "" };
// 	const issueLabel = status => ({ "New Alert": __("Needs Review"), "Confirmed": __("Awaiting Scheduling") }[status] || __(status));
// 	const alertLabel = status => status === "Confirmed" ? __("Approved · service pending") : __(status);
// 	const activeIssueStatuses = ["Confirmed", "Scheduled", "Re-scheduled", "In Progress", "On Hold"];
// 	const expandedAlerts = new Set();
// 	let loading = false;
// 	const refresh = async () => {
// 		if (loading) return;
// 		loading = true;
// 		body.empty();
// 		body.attr("aria-busy", "true");
// 		text("<p>", __("Loading solar performance…"), body, "eola-empty").attr("role", "status");
// 		try {
// 			const { message: data } = await frappe.call("eola.api.dashboard");
// 			body.empty();
// 			const hero = $('<header class="eola-hero"></header>').appendTo(body);
// 			text("<div>", __("EOLA · Performance monitoring"), hero, "eola-eyebrow");
// 			text("<h2>", __("Solar performance overview"), hero);
// 			text("<p>", __("Review solar performance, assess possible causes and approve the next steps."), hero);
// 			const metrics = $('<div class="eola-metrics"></div>').appendTo(body);
// 			for (const [label, value] of [["Systems Monitored", data.systems_monitored], ["Alerts Today", data.alerts_today], ["Systems Needing Review", data.systems_needing_review], ["Maintenance Cases", data.maintenance_cases]]) {
// 				const card = $(label === "Maintenance Cases" ? '<button type="button" class="eola-metric"></button>' : '<div class="eola-metric"></div>').appendTo(metrics);
// 				if (label === "Maintenance Cases") card.on("click", () => { issueFilters.status = "active"; issueFilters.search = ""; issueSearch.val(""); issueStatus.val("active"); renderIssues(); switchTab("issues", true); });
// 				text("<span>", __(label), card);
// 				text("<strong>", String(value), card);
// 			}
// 			const tabs = $('<div class="eola-tabs" role="tablist"></div>').attr("aria-label", __("Dashboard views")).appendTo(body);
// 			const panels = {};
// 			const tabButtons = {};
// 			const switchTab = (key, focus = false) => {
// 				activeTab = key;
// 				for (const name of ["alerts", "issues"]) {
// 					panels[name].prop("hidden", name !== key);
// 					tabButtons[name].attr({ "aria-selected": String(name === key), tabindex: name === key ? "0" : "-1" });
// 				}
// 				if (focus) tabButtons[key].trigger("focus");
// 			};
// 			for (const [key, label] of [["alerts", "Performance Alerts"], ["issues", "Issue List"]]) {
// 				tabButtons[key] = button(tabs, label, () => switchTab(key)).attr({ role: "tab", id: `eola-tab-${key}`, "aria-controls": `eola-panel-${key}` });
// 				panels[key] = $('<section role="tabpanel"></section>').attr({ id: `eola-panel-${key}`, "aria-labelledby": `eola-tab-${key}` }).appendTo(body);
// 				tabButtons[key].on("keydown", event => {
// 					if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
// 						event.preventDefault();
// 						switchTab(event.key === "Home" ? "alerts" : event.key === "End" ? "issues" : key === "alerts" ? "issues" : "alerts", true);
// 					}
// 				});
// 			}
// 			const issueHeading = $('<div class="eola-section"></div>').appendTo(panels.issues);
// 			text("<h3>", __("Issue List"), issueHeading);
// 			button(issueHeading, "View all issues", () => frappe.set_route("List", "ES Issue"));
// 			text("<p>", __("Technician approval authorizes service. An issue remains open until its resolution is recorded."), panels.issues, "text-muted");
// 			const issueTools = $('<div class="eola-issue-tools"></div>').appendTo(panels.issues);
// 			const issueSearchLabel = text("<label>", __("Search issues"), issueTools);
// 			const issueSearch = $('<input type="search" class="form-control">').attr("placeholder", __("Issue, alert or solar system…")).val(issueFilters.search).appendTo(issueSearchLabel);
// 			const issueStatusLabel = text("<label>", __("Issue status"), issueTools);
// 			const issueStatus = $('<select class="form-control"></select>').appendTo(issueStatusLabel);
// 			for (const [value, label] of [["", __("All statuses")], ["active", __("Active maintenance cases")], ...["New Alert", "Confirmed", "Scheduled", "Re-scheduled", "In Progress", "On Hold", "Resolved", "Closed", "Dismissed"].map(status => [status, issueLabel(status)])]) text("<option>", label, issueStatus).val(value);
// 			issueStatus.val(issueFilters.status);
// 			const issueCount = $('<p role="status" aria-live="polite" class="eola-result-count"></p>').appendTo(panels.issues);
// 			const issueList = $("<div>").appendTo(panels.issues);
// 			const renderIssues = () => {
// 				issueList.empty();
// 				const query = issueFilters.search.trim().toLowerCase();
// 				const issues = (data.issues || []).filter(issue => (!issueFilters.status || (issueFilters.status === "active" ? activeIssueStatuses.includes(issue.status) : issue.status === issueFilters.status)) && [issue.name, issue.subject, issue.performance_alert, issue.installed_solar_system].join(" ").toLowerCase().includes(query));
// 				issueCount.text(__("{0} issues", [issues.length]));
// 				if (!issues.length) {
// 					text("<p>", __("No issues match this view. Select all statuses or clear your search."), issueList, "eola-empty");
// 					button(issueList, "Show all issues", () => { issueFilters.search = issueFilters.status = ""; issueSearch.val(""); issueStatus.val(""); renderIssues(); });
// 				}
// 				for (const issue of issues) {
// 					const card = $('<article class="eola-alert"></article>').appendTo(issueList);
// 					const head = $('<div class="eola-alert-head"></div>').appendTo(card);
// 					const badges = $('<div class="eola-badges"></div>').appendTo(head);
// 					text("<span>", issueLabel(issue.status), badges, "eola-badge");
// 					text("<span>", __("Priority: {0}", [__(issue.priority)]), badges, "eola-badge");
// 					text("<h4>", issue.subject, head);
// 					text("<p>", [issue.name, issue.installed_solar_system, issue.service_type && __(issue.service_type)].filter(Boolean).join(" · "), head, "eola-system");
// 					if (issue.scheduled_date) text("<p>", __("Scheduled: {0}", [frappe.datetime.str_to_user(issue.scheduled_date)]), head);
// 					if (issue.status === "Re-scheduled" && issue.reschedule_reason) text("<p>", issue.reschedule_reason, head);
// 					if (issue.resolved_date) text("<p>", __("Resolved: {0}", [frappe.datetime.str_to_user(issue.resolved_date)]), head);
// 					const actions = $('<div class="eola-footer"></div>').appendTo(card);
// 					button(actions, "Open issue", () => frappe.set_route("Form", "ES Issue", issue.name));
// 					if (issue.performance_alert) button(actions, "View linked alert", () => frappe.set_route("Form", "Performance Alert", issue.performance_alert));
// 				}
// 			};
// 			issueSearch.on("input", () => { issueFilters.search = issueSearch.val(); renderIssues(); });
// 			issueStatus.on("change", () => { issueFilters.status = issueStatus.val(); renderIssues(); });
// 			renderIssues();
// 			switchTab(activeTab);
// 			const heading = $('<div class="eola-section"></div>').appendTo(panels.alerts);
// 			text("<h3>", __("Performance alerts"), heading);
// 			button(heading, "View all alerts", () => frappe.set_route("List", "Performance Alert"));
// 			const toolbar = $('<div class="eola-toolbar"></div>').appendTo(panels.alerts);
// 			const searchField = $("<div>").appendTo(toolbar);
// 			text("<label>", __("Search alerts"), searchField).attr("for", "eola-search");
// 			const search = $('<input type="search" id="eola-search" class="form-control">').attr("placeholder", __("Alert or solar system…")).val(filters.search).appendTo(searchField);
// 			const select = (key, label, options) => {
// 				const field = $("<div>").appendTo(toolbar);
// 				text("<label>", __(label), field).attr("for", `eola-${key}`);
// 				const input = $('<select class="form-control"></select>').attr("id", `eola-${key}`).appendTo(field);
// 				for (const [value, title] of options) text("<option>", __(title), input).val(value);
// 				return input.val(filters[key]).on("change", () => { filters[key] = input.val(); renderAlerts(); });
// 			};
// 			select("severity", "Severity", [["", "All severities"], ["Critical", "Critical"], ["Warning", "Warning"]]);
// 			select("status", "Status", [["", "All statuses"], ["New Alert", "New Alert"], ["Under Review", "Under Review"], ["Confirmed", "Approved · service pending"]]);
// 			select("sort", "Sort by", [["priority", "Critical first"], ["newest", "Newest first"], ["deviation", "Largest shortfall"]]);
// 			const count = $('<p class="eola-result-count" role="status" aria-live="polite"></p>').appendTo(panels.alerts);
// 			const list = $('<div class="eola-alert-list"></div>').appendTo(panels.alerts);
// 			search.on("input", () => { filters.search = search.val(); renderAlerts(); });
// 			const renderAlerts = () => {
// 				list.empty();
// 				const query = filters.search.trim().toLowerCase();
// 				const alerts = data.alerts.filter(alert =>
// 					(!filters.severity || alert.severity === filters.severity) &&
// 					(!filters.status || alert.status === filters.status) &&
// 					(!query || [alert.alert_name, alert.name, alert.installed_solar_system].join(" ").toLowerCase().includes(query))
// 				).sort((a, b) => {
// 					if (filters.sort === "priority") {
// 						const priority = Number(b.severity === "Critical") - Number(a.severity === "Critical");
// 						if (priority) return priority;
// 					}
// 					if (filters.sort === "deviation") return Number(a.deviation) - Number(b.deviation);
// 					return String(b.alert_date).localeCompare(String(a.alert_date));
// 				});
// 				count.text(__("{0} of {1} loaded alerts", [alerts.length, data.alerts.length]) + (data.alerts.length === 50 ? " · " + __("Latest 50 loaded. View all alerts for the full list.") : ""));
// 				if (!alerts.length) {
// 					const empty = $('<div class="eola-empty"></div>').appendTo(list);
// 					text("<h4>", data.alerts.length ? __("No matching alerts") : __("No open performance alerts"), empty);
// 					text("<p>", data.alerts.length ? __("Try another search or clear the filters.") : __("Refresh to check for new performance updates."), empty);
// 					if (data.alerts.length) button(empty, "Clear filters", () => {
// 						filters.search = filters.severity = filters.status = "";
// 						toolbar.find("input").val("");
// 						toolbar.find("#eola-severity, #eola-status").val("");
// 						renderAlerts();
// 						search.trigger("focus");
// 					});
// 				}
// 				for (const [index, alert] of alerts.entries()) {
// 					const rec = alert.recommendation;
// 					const card = $('<article class="eola-alert"></article>').toggleClass("critical", alert.severity === "Critical").appendTo(list);
// 					const head = $('<div class="eola-alert-head"></div>').appendTo(card);
// 					const badges = $('<div class="eola-badges"></div>').appendTo(head);
// 					text("<span>", __(alert.severity), badges, "eola-badge eola-severity");
// 					text("<span>", alertLabel(alert.status), badges, "eola-badge");
// 					if (alert.issue) text("<span>", __("Issue: {0}", [issueLabel(alert.issue.status)]), badges, "eola-badge");
// 					text("<h4>", alert.alert_name, head);
// 					text("<div>", alert.installed_solar_system, head, "eola-system");
// 					const stats = $('<div class="eola-stats"></div>').appendTo(head);
// 					for (const value of [frappe.datetime.str_to_user(alert.alert_date), `${Number(alert.deviation).toFixed(1)}% ${__("vs expected")}`, `${Number((Number(alert.duration) / 3600).toFixed(1))} ${__("affected hours")}`]) text("<span>", value, stats);
// 					if (rec) {
// 						text("<p>", rec.finding, head, "eola-finding");
// 						const columnsId = `eola-alert-columns-${index}`;
// 						const columns = $('<div class="eola-columns" hidden></div>').attr("id", columnsId).appendTo(card);
// 						const toggle = button(head, "Show recommendation", () => {
// 							const expanded = toggle.attr("aria-expanded") !== "true";
// 							if (expanded) expandedAlerts.add(alert.name);
// 							else expandedAlerts.delete(alert.name);
// 							toggle.attr("aria-expanded", String(expanded)).text(expanded ? __("Hide recommendation") : __("Show recommendation"));
// 							columns.prop("hidden", !expanded);
// 						}, "btn-default eola-details");
// 						const expanded = expandedAlerts.has(alert.name);
// 						toggle.attr({ "aria-expanded": String(expanded), "aria-controls": columnsId });
// 						if (expanded) toggle.text(__("Hide recommendation"));
// 						columns.prop("hidden", !expanded);
// 						for (const [label, content] of [["Possible reasons", rec.possible_causes], ["Recommended actions", rec.recommended_action]]) {
// 							const column = $("<section>").appendTo(columns);
// 							text("<h5>", __(label), column);
// 							text("<div>", content || __("Not provided"), column, "eola-lines");
// 						}
// 						if (rec.technician_modification) text("<div>", `${__("Approved modified actions")}\n${rec.technician_modification}`, card, "eola-note eola-lines");
// 						text("<div>", rec.ai_disclaimer, card, "eola-note");
// 					} else text("<p>", __("No recommendation available to review."), head, "text-muted");
// 					const footer = $('<div class="eola-footer"></div>').appendTo(card);
// 					if (alert.issue) button(footer, "Open issue", () => frappe.set_route("Form", "ES Issue", alert.issue.name));
// 					button(footer, "Open recommendation", () => rec ? frappe.set_route("Form", "AI Recommendation", rec.name) : frappe.set_route("List", "AI Recommendation", { performance_alert: alert.name }));
// 					const actions = $('<div class="eola-actions"></div>').appendTo(footer);
// 					if (alert.can_review) {
// 						button(actions, "Accept", () => review(alert, "Accept"), "eola-accept");
// 						button(actions, "Modify", () => review(alert, "Modify"));
// 						button(actions, "Reject", () => review(alert, "Reject"), "btn-default eola-reject");
// 					} else if (rec) text("<span>", `${__("Decision")}: ${__(rec.technician_decision)}`, actions, "text-muted");
// 				}
// 			};
// 			renderAlerts();
// 		} catch (error) {
// 			body.empty();
// 			text("<p>", __("Unable to load dashboard. Check your connection and permissions, then try again."), body, "eola-empty").attr("role", "alert");
// 			button(body, "Try again", refresh);
// 		} finally { loading = false; body.attr("aria-busy", "false"); }
// 	};
// 	page.set_primary_action(__("Refresh"), refresh);
// 	wrapper.eola_refresh = refresh;
// };
// frappe.pages["eola-dashboard"].on_page_show = (wrapper) => wrapper.eola_refresh();



// frappe.pages["eola-dashboard"].on_page_load = function (wrapper) {
// 	const page = frappe.ui.make_app_page({ parent: wrapper, title: __("EOLA Dashboard"), single_column: true });
// 	const body = $('<div class="eola-review-dashboard"></div>').appendTo(page.main);
// 	$(`<style>
// 	.eola-review-dashboard {
// 		--eola-radius:14px; --eola-radius-sm:10px;
// 		--eola-shadow:0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06);
// 		--eola-shadow-hover:0 6px 16px rgba(16,24,40,.10), 0 2px 6px rgba(16,24,40,.06);
// 		--eola-brand:#12766f; --eola-brand-dark:#0d5b55;
// 		padding:16px; max-width:1280px; margin:0 auto; color:var(--text-color);
// 	}
// 	.eola-review-dashboard .eola-icon { width:16px; height:16px; flex:0 0 auto; }
// 	.eola-review-dashboard .eola-icon-lg { width:30px; height:30px; margin:0 auto 8px; display:block; color:var(--text-muted); opacity:.75; }
// 	.eola-review-dashboard .eola-spin { animation:eola-spin 1s linear infinite; }
// 	@keyframes eola-spin { to { transform:rotate(360deg); } }
//
// 	.eola-review-dashboard .eola-hero { position:relative; overflow:hidden; background:linear-gradient(135deg,#0d2b33,#14746c 60%,#1c8f83); color:#fff; padding:18px 20px; border-radius:var(--eola-radius); margin-bottom:16px; }
// 	.eola-review-dashboard .eola-hero::after { content:""; position:absolute; right:-50px; top:-60px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,.08); }
// 	.eola-review-dashboard .eola-hero-icon { position:relative; width:36px; height:36px; border-radius:10px; background:rgba(255,255,255,.16); display:flex; align-items:center; justify-content:center; margin-bottom:8px; }
// 	.eola-review-dashboard .eola-hero-icon .eola-icon { width:20px; height:20px; }
// 	.eola-review-dashboard .eola-eyebrow { position:relative; text-transform:uppercase; letter-spacing:2px; font-size:11px; font-weight:700; opacity:.8; }
// 	.eola-review-dashboard .eola-hero h2 { position:relative; color:#fff; margin:4px 0 4px; font-size:22px; font-weight:700; }
// 	.eola-review-dashboard .eola-hero p { position:relative; margin:0; color:#d4ece8; max-width:560px; font-size:13px; }
//
// 	.eola-review-dashboard .eola-metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; margin-bottom:16px; }
// 	.eola-review-dashboard .eola-metric { border:1px solid var(--border-color); background:var(--card-bg); padding:12px; border-radius:var(--eola-radius-sm); box-shadow:var(--eola-shadow); transition:box-shadow .15s ease, transform .15s ease; text-align:left; }
// 	.eola-review-dashboard button.eola-metric { cursor:pointer; }
// 	.eola-review-dashboard button.eola-metric:hover { box-shadow:var(--eola-shadow-hover); transform:translateY(-2px); }
// 	.eola-review-dashboard .eola-metric-icon { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:6px; }
// 	.eola-review-dashboard .eola-metric span { display:block; color:var(--text-muted); font-size:12px; font-weight:500; }
// 	.eola-review-dashboard .eola-metric strong { display:block; font-size:22px; margin-top:2px; font-weight:700; }
//
// 	.eola-review-dashboard .eola-tabs { display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap; }
// 	.eola-review-dashboard .eola-tabs button { display:inline-flex; align-items:center; gap:5px; border:1px solid var(--border-color); background:var(--card-bg); padding:6px 12px; border-radius:999px; font-weight:600; font-size:12.5px; color:var(--text-muted); transition:all .15s ease; }
// 	.eola-review-dashboard .eola-tabs button:hover { border-color:var(--eola-brand); color:var(--eola-brand); }
// 	.eola-review-dashboard .eola-tabs button[aria-selected="true"] { background:var(--eola-brand); border-color:var(--eola-brand); color:#fff; }
// 	.eola-review-dashboard [role="tabpanel"][hidden] { display:none; }
//
// 	.eola-review-dashboard .eola-section { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:10px; flex-wrap:wrap; }
// 	.eola-review-dashboard .eola-section h3 { margin:0; display:flex; align-items:center; gap:6px; }
//
// 	.eola-review-dashboard .eola-toolbar { display:grid; grid-template-columns:minmax(200px,2fr) repeat(3,minmax(150px,1fr)); gap:10px; padding:10px; background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--eola-radius-sm); margin-bottom:12px; }
// 	.eola-review-dashboard .eola-toolbar label { display:block; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.4px; color:var(--text-muted); margin-bottom:4px; }
// 	.eola-review-dashboard .eola-toolbar .form-control { width:100%; min-height:32px; }
// 	.eola-review-dashboard .eola-issue-tools { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px; }
// 	.eola-review-dashboard .eola-issue-tools > label { flex:1; min-width:180px; display:block; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.4px; color:var(--text-muted); margin-bottom:4px; }
//
// 	.eola-review-dashboard .eola-search-wrap { position:relative; }
// 	.eola-review-dashboard .eola-search-wrap .eola-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--text-muted); width:15px; height:15px; }
// 	.eola-review-dashboard .eola-search-wrap input { padding-left:32px; }
//
// 	.eola-review-dashboard .eola-result-count { margin:0 0 10px; color:var(--text-muted); font-size:12.5px; }
//
// 	.eola-review-dashboard .eola-alert { background:var(--card-bg); border:1px solid var(--border-color); border-left:4px solid #d59628; border-radius:var(--eola-radius-sm); margin-bottom:10px; overflow:hidden; box-shadow:var(--eola-shadow); transition:box-shadow .15s ease, transform .15s ease; }
// 	.eola-review-dashboard .eola-alert:hover { box-shadow:var(--eola-shadow-hover); }
// 	.eola-review-dashboard .eola-alert.critical { border-left-color:#d64545; }
// 	.eola-review-dashboard .eola-alert-head { padding:12px 14px 10px; }
// 	.eola-review-dashboard .eola-badges { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; }
// 	.eola-review-dashboard .eola-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:20px; background:var(--control-bg); font-size:11.5px; font-weight:600; }
// 	.eola-review-dashboard .eola-badge .eola-icon { width:11px; height:11px; }
// 	.eola-review-dashboard .eola-severity { background:#fff3d6; color:#8a5a06; }
// 	.eola-review-dashboard .critical .eola-severity { background:#fde2e2; color:#a1282f; }
// 	.eola-review-dashboard h4 { font-size:16px; margin:0 0 6px; line-height:1.35; overflow-wrap:anywhere; }
// 	.eola-review-dashboard .eola-system { margin-bottom:6px; color:var(--text-muted); font-size:12.5px; }
// 	.eola-review-dashboard .eola-stats { display:flex; gap:14px; flex-wrap:wrap; color:var(--text-muted); font-size:12.5px; }
// 	.eola-review-dashboard .eola-stats > span { display:inline-flex; align-items:center; gap:4px; }
// 	.eola-review-dashboard .eola-field-line { display:flex; align-items:center; gap:5px; margin:5px 0 0; font-size:12.5px; color:var(--text-color); }
// 	.eola-review-dashboard .eola-field-line .eola-icon { color:var(--text-muted); }
//
// 	.eola-review-dashboard .eola-finding-wrap { display:flex; gap:6px; align-items:flex-start; margin-top:8px; }
// 	.eola-review-dashboard .eola-finding-icon { width:14px; height:14px; margin-top:2px; color:var(--eola-brand); }
// 	.eola-review-dashboard .eola-finding { margin:0; line-height:1.5; }
//
// 	.eola-review-dashboard .eola-details { margin-top:8px; display:inline-flex; align-items:center; gap:5px; }
// 	.eola-review-dashboard .eola-details .eola-icon { transition:transform .15s ease; }
// 	.eola-review-dashboard .eola-details[aria-expanded="true"] .eola-icon { transform:rotate(180deg); }
//
// 	.eola-review-dashboard .eola-columns { display:grid; grid-template-columns:1fr 1fr; gap:14px; padding:12px 14px; border-top:1px solid var(--border-color); }
// 	.eola-review-dashboard .eola-columns[hidden] { display:none; }
// 	.eola-review-dashboard .eola-columns h5 { display:flex; align-items:center; gap:5px; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin:0 0 8px; }
// 	.eola-review-dashboard .eola-lines { white-space:pre-wrap; line-height:1.6; font-size:12.5px; overflow-wrap:anywhere; }
//
// 	.eola-review-dashboard .eola-note { display:flex; align-items:flex-start; gap:6px; padding:0 14px 10px; color:var(--text-muted); font-size:11.5px; }
// 	.eola-review-dashboard .eola-note .eola-icon { width:13px; height:13px; margin-top:2px; }
//
// 	.eola-review-dashboard .eola-footer { padding:10px 14px; background:var(--subtle-fg); display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; border-top:1px solid var(--border-color); }
// 	.eola-review-dashboard .eola-actions { display:flex; gap:6px; flex-wrap:wrap; }
// 	.eola-review-dashboard .btn { display:inline-flex; align-items:center; gap:5px; min-height:30px; }
// 	.eola-review-dashboard .eola-accept { background:var(--eola-brand); color:#fff; border-color:var(--eola-brand); }
// 	.eola-review-dashboard .eola-accept:hover { background:var(--eola-brand-dark); color:#fff; }
// 	.eola-review-dashboard .eola-reject { color:var(--red-600); }
// 	.eola-review-dashboard .eola-reject:hover { background:#fde2e2; }
//
// 	.eola-review-dashboard .eola-empty { padding:24px 16px; text-align:center; border:1px dashed var(--border-color); border-radius:var(--eola-radius-sm); color:var(--text-muted); }
// 	.eola-review-dashboard .eola-empty h4 { margin:0 0 4px; color:var(--text-color); }
// 	.eola-review-dashboard p.text-muted { margin:0 0 10px; font-size:12.5px; }
//
// 	.eola-review-dashboard :is(button,input,select,a):focus-visible { outline:2px solid var(--primary); outline-offset:3px; }
//
// 	@media(max-width:900px) { .eola-review-dashboard .eola-metrics { grid-template-columns:repeat(2,1fr); } .eola-review-dashboard .eola-columns { grid-template-columns:1fr; } .eola-review-dashboard .eola-toolbar { grid-template-columns:1fr 1fr; } }
// 	@media(max-width:540px) { .eola-review-dashboard { padding:8px; } .eola-review-dashboard .eola-hero { padding:14px; } .eola-review-dashboard .eola-alert-head,.eola-review-dashboard .eola-columns,.eola-review-dashboard .eola-footer { padding:10px; } .eola-review-dashboard .eola-toolbar { grid-template-columns:1fr; } .eola-review-dashboard .eola-metric { padding:10px; } }
// 	</style>`).appendTo(page.main);
//
// 	// ---------- Icon set (inline SVG, no external dependency) ----------
// 	const ICONS = {
// 		sun: '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>',
// 		activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',
// 		alertTriangle: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
// 		alertOctagon: '<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
// 		search: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
// 		tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>',
// 		check: '<polyline points="20 6 9 17 4 12"></polyline>',
// 		edit: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>',
// 		x: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
// 		externalLink: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>',
// 		refresh: '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>',
// 		calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
// 		clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
// 		chevronDown: '<polyline points="6 9 12 15 18 9"></polyline>',
// 		list: '<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>',
// 		inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>',
// 		info: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
// 		checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
// 		clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>',
// 		flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>',
// 	};
// 	const icon = (name, cls = "") => `<svg class="eola-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
// 	const statusIcon = status => ({
// 		"New Alert": "alertTriangle", "Under Review": "search", "Confirmed": "checkCircle",
// 		"Scheduled": "calendar", "Re-scheduled": "calendar", "In Progress": "tool",
// 		"On Hold": "clock", "Resolved": "checkCircle", "Closed": "checkCircle", "Dismissed": "x",
// 	}[status] || "info");
//
// 	// ---------- DOM helpers ----------
// 	const text = (tag, value, parent, cls) => $(tag).addClass(cls || "").text(value || "").appendTo(parent);
// 	const button = (parent, label, handler, cls = "btn-default", iconName) => {
// 		const btn = $('<button type="button" class="btn btn-sm"></button>').addClass(cls).on("click", handler).appendTo(parent);
// 		if (iconName) btn.append(icon(iconName));
// 		$("<span>").text(__(label)).appendTo(btn);
// 		return btn;
// 	};
// 	const badge = (parent, label, cls, iconName) => {
// 		const el = $('<span class="eola-badge"></span>').addClass(cls || "").appendTo(parent);
// 		if (iconName) el.append(icon(iconName));
// 		$("<span>").text(label).appendTo(el);
// 		return el;
// 	};
// 	const stat = (parent, iconName, value) => {
// 		const el = $("<span></span>").appendTo(parent);
// 		el.append(icon(iconName));
// 		$("<span>").text(value).appendTo(el);
// 	};
// 	const fieldLine = (parent, iconName, value) => {
// 		const p = $('<p class="eola-field-line"></p>').appendTo(parent);
// 		p.append(icon(iconName));
// 		$("<span>").text(value).appendTo(p);
// 	};
// 	const note = (parent, iconName, content) => {
// 		const el = $('<div class="eola-note"></div>').appendTo(parent);
// 		el.append(icon(iconName));
// 		$('<div class="eola-lines"></div>').text(content).appendTo(el);
// 	};
// 	const emptyState = (parent, iconName, title, body_, actionLabel, actionHandler, actionIcon) => {
// 		const el = $('<div class="eola-empty"></div>').appendTo(parent);
// 		el.append(icon(iconName, "eola-icon-lg"));
// 		if (title) text("<h4>", title, el);
// 		if (body_) text("<p>", body_, el);
// 		if (actionLabel) button(el, actionLabel, actionHandler, "btn-default", actionIcon);
// 		return el;
// 	};
//
// 	const review = (alert, decision) => {
// 		const dialog = new frappe.ui.Dialog({
// 			title: __("{0} Recommendation", [decision]),
// 			fields: [
// 				{ fieldname: "modification", label: __("Modified Actions"), fieldtype: "Long Text", reqd: decision === "Modify", hidden: decision !== "Modify", default: decision === "Modify" ? alert.recommendation.recommended_action : "" },
// 				{ fieldname: "remarks", label: __("Technician Remarks"), fieldtype: "Long Text", reqd: decision === "Reject" },
// 			],
// 			primary_action_label: __("Confirm {0}", [decision]),
// 			async primary_action(values) {
// 				dialog.get_primary_btn().prop("disabled", true);
// 				try {
// 					await frappe.call({ method: "eola.api.review_recommendation", args: { name: alert.recommendation.name, decision, ...values }, freeze: true });
// 					dialog.hide();
// 					frappe.show_alert({ message: __("Review saved"), indicator: "green" });
// 					await refresh();
// 				} finally {
// 					dialog.get_primary_btn().prop("disabled", false);
// 				}
// 			},
// 		});
// 		dialog.show();
// 	};
//
// 	const filters = { search: "", severity: "", status: "", sort: "priority" };
// 	let activeTab = "alerts";
// 	const issueFilters = { search: "", status: "" };
// 	const issueLabel = status => ({ "New Alert": __("Needs Review"), "Confirmed": __("Awaiting Scheduling") }[status] || __(status));
// 	const alertLabel = status => status === "Confirmed" ? __("Approved · service pending") : __(status);
// 	const activeIssueStatuses = ["Confirmed", "Scheduled", "Re-scheduled", "In Progress", "On Hold"];
// 	const expandedAlerts = new Set();
// 	let loading = false;
//
// 	const refresh = async () => {
// 		if (loading) return;
// 		loading = true;
// 		body.empty();
// 		body.attr("aria-busy", "true");
// 		emptyState(body, "refresh", null, __("Loading solar performance…")).attr("role", "status");
// 		body.find(".eola-icon-lg").addClass("eola-spin");
// 		try {
// 			const { message: data } = await frappe.call("eola.api.dashboard");
// 			body.empty();
//
// 			const hero = $('<header class="eola-hero"></header>').appendTo(body);
// 			$('<div class="eola-hero-icon"></div>').html(icon("sun")).appendTo(hero);
// 			text("<div>", __("EOLA · Performance monitoring"), hero, "eola-eyebrow");
// 			text("<h2>", __("Solar performance overview"), hero);
// 			text("<p>", __("Review solar performance, assess possible causes and approve the next steps."), hero);
//
// 			const metrics = $('<div class="eola-metrics"></div>').appendTo(body);
// 			const metricDefs = [
// 				["Systems Monitored", data.systems_monitored, "sun", "#e3f6f4", "#0f6f68"],
// 				["Alerts Today", data.alerts_today, "alertTriangle", "#fff1e0", "#b45309"],
// 				["Systems Needing Review", data.systems_needing_review, "search", "#e8f0fe", "#1d4ed8"],
// 				["Maintenance Cases", data.maintenance_cases, "tool", "#f3e8ff", "#7e22ce"],
// 			];
// 			for (const [label, value, iconName, bg, fg] of metricDefs) {
// 				const card = $(label === "Maintenance Cases" ? '<button type="button" class="eola-metric"></button>' : '<div class="eola-metric"></div>').appendTo(metrics);
// 				if (label === "Maintenance Cases") card.on("click", () => { issueFilters.status = "active"; issueFilters.search = ""; issueSearch.val(""); issueStatus.val("active"); renderIssues(); switchTab("issues", true); });
// 				$('<div class="eola-metric-icon"></div>').css({ background: bg, color: fg }).html(icon(iconName)).appendTo(card);
// 				text("<span>", __(label), card);
// 				text("<strong>", String(value), card);
// 			}
//
// 			const tabs = $('<div class="eola-tabs" role="tablist"></div>').attr("aria-label", __("Dashboard views")).appendTo(body);
// 			const panels = {};
// 			const tabButtons = {};
// 			const switchTab = (key, focus = false) => {
// 				activeTab = key;
// 				for (const name of ["alerts", "issues"]) {
// 					panels[name].prop("hidden", name !== key);
// 					tabButtons[name].attr({ "aria-selected": String(name === key), tabindex: name === key ? "0" : "-1" });
// 				}
// 				if (focus) tabButtons[key].trigger("focus");
// 			};
// 			for (const [key, label, iconName] of [["alerts", "Performance Alerts", "alertTriangle"], ["issues", "Issue List", "list"]]) {
// 				tabButtons[key] = button(tabs, label, () => switchTab(key), "btn-default", iconName).attr({ role: "tab", id: `eola-tab-${key}`, "aria-controls": `eola-panel-${key}` });
// 				panels[key] = $('<section role="tabpanel"></section>').attr({ id: `eola-panel-${key}`, "aria-labelledby": `eola-tab-${key}` }).appendTo(body);
// 				tabButtons[key].on("keydown", event => {
// 					if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
// 						event.preventDefault();
// 						switchTab(event.key === "Home" ? "alerts" : event.key === "End" ? "issues" : key === "alerts" ? "issues" : "alerts", true);
// 					}
// 				});
// 			}
//
// 			// ---------- Issues panel ----------
// 			const issueHeading = $('<div class="eola-section"></div>').appendTo(panels.issues);
// 			$("<h3>").html(icon("list")).append($("<span>").text(__("Issue List"))).appendTo(issueHeading);
// 			button(issueHeading, "View all issues", () => frappe.set_route("List", "ES Issue"), "btn-default", "externalLink");
// 			text("<p>", __("Technician approval authorizes service. An issue remains open until its resolution is recorded."), panels.issues, "text-muted");
//
// 			const issueTools = $('<div class="eola-issue-tools"></div>').appendTo(panels.issues);
// 			const issueSearchLabel = text("<label>", __("Search issues"), issueTools);
// 			const issueSearchWrap = $('<div class="eola-search-wrap"></div>').appendTo(issueSearchLabel);
// 			issueSearchWrap.append(icon("search", "eola-search-icon"));
// 			const issueSearch = $('<input type="search" class="form-control">').attr("placeholder", __("Issue, alert or solar system…")).val(issueFilters.search).appendTo(issueSearchWrap);
// 			const issueStatusLabel = text("<label>", __("Issue status"), issueTools);
// 			const issueStatus = $('<select class="form-control"></select>').appendTo(issueStatusLabel);
// 			for (const [value, label] of [["", __("All statuses")], ["active", __("Active maintenance cases")], ...["New Alert", "Confirmed", "Scheduled", "Re-scheduled", "In Progress", "On Hold", "Resolved", "Closed", "Dismissed"].map(status => [status, issueLabel(status)])]) text("<option>", label, issueStatus).val(value);
// 			issueStatus.val(issueFilters.status);
//
// 			const issueCount = $('<p role="status" aria-live="polite" class="eola-result-count"></p>').appendTo(panels.issues);
// 			const issueList = $("<div>").appendTo(panels.issues);
// 			const renderIssues = () => {
// 				issueList.empty();
// 				const query = issueFilters.search.trim().toLowerCase();
// 				const issues = (data.issues || []).filter(issue => (!issueFilters.status || (issueFilters.status === "active" ? activeIssueStatuses.includes(issue.status) : issue.status === issueFilters.status)) && [issue.name, issue.subject, issue.performance_alert, issue.installed_solar_system].join(" ").toLowerCase().includes(query));
// 				issueCount.text(__("{0} issues", [issues.length]));
// 				if (!issues.length) {
// 					emptyState(issueList, "inbox", null, __("No issues match this view. Select all statuses or clear your search."), __("Show all issues"), () => { issueFilters.search = issueFilters.status = ""; issueSearch.val(""); issueStatus.val(""); renderIssues(); }, "refresh");
// 				}
// 				for (const issue of issues) {
// 					const card = $('<article class="eola-alert"></article>').appendTo(issueList);
// 					const head = $('<div class="eola-alert-head"></div>').appendTo(card);
// 					const badges = $('<div class="eola-badges"></div>').appendTo(head);
// 					badge(badges, issueLabel(issue.status), "", statusIcon(issue.status));
// 					badge(badges, __("Priority: {0}", [__(issue.priority)]), "", "flag");
// 					text("<h4>", issue.subject, head);
// 					text("<p>", [issue.name, issue.installed_solar_system, issue.service_type && __(issue.service_type)].filter(Boolean).join(" · "), head, "eola-system");
// 					if (issue.scheduled_date) fieldLine(head, "calendar", __("Scheduled: {0}", [frappe.datetime.str_to_user(issue.scheduled_date)]));
// 					if (issue.status === "Re-scheduled" && issue.reschedule_reason) fieldLine(head, "alertTriangle", issue.reschedule_reason);
// 					if (issue.resolved_date) fieldLine(head, "checkCircle", __("Resolved: {0}", [frappe.datetime.str_to_user(issue.resolved_date)]));
// 					const actions = $('<div class="eola-footer"></div>').appendTo(card);
// 					button(actions, "Open issue", () => frappe.set_route("Form", "ES Issue", issue.name), "btn-default", "tool");
// 					if (issue.performance_alert) button(actions, "View linked alert", () => frappe.set_route("Form", "Performance Alert", issue.performance_alert), "btn-default", "externalLink");
// 				}
// 			};
// 			issueSearch.on("input", () => { issueFilters.search = issueSearch.val(); renderIssues(); });
// 			issueStatus.on("change", () => { issueFilters.status = issueStatus.val(); renderIssues(); });
// 			renderIssues();
// 			switchTab(activeTab);
//
// 			// ---------- Alerts panel ----------
// 			const heading = $('<div class="eola-section"></div>').appendTo(panels.alerts);
// 			$("<h3>").html(icon("alertTriangle")).append($("<span>").text(__("Performance alerts"))).appendTo(heading);
// 			button(heading, "View all alerts", () => frappe.set_route("List", "Performance Alert"), "btn-default", "externalLink");
//
// 			const toolbar = $('<div class="eola-toolbar"></div>').appendTo(panels.alerts);
// 			const searchField = $("<div>").appendTo(toolbar);
// 			text("<label>", __("Search alerts"), searchField).attr("for", "eola-search");
// 			const searchWrap = $('<div class="eola-search-wrap"></div>').appendTo(searchField);
// 			searchWrap.append(icon("search", "eola-search-icon"));
// 			const search = $('<input type="search" id="eola-search" class="form-control">').attr("placeholder", __("Alert or solar system…")).val(filters.search).appendTo(searchWrap);
// 			const select = (key, label, options) => {
// 				const field = $("<div>").appendTo(toolbar);
// 				text("<label>", __(label), field).attr("for", `eola-${key}`);
// 				const input = $('<select class="form-control"></select>').attr("id", `eola-${key}`).appendTo(field);
// 				for (const [value, title] of options) text("<option>", __(title), input).val(value);
// 				return input.val(filters[key]).on("change", () => { filters[key] = input.val(); renderAlerts(); });
// 			};
// 			select("severity", "Severity", [["", "All severities"], ["Critical", "Critical"], ["Warning", "Warning"]]);
// 			select("status", "Status", [["", "All statuses"], ["New Alert", "New Alert"], ["Under Review", "Under Review"], ["Confirmed", "Approved · service pending"]]);
// 			select("sort", "Sort by", [["priority", "Critical first"], ["newest", "Newest first"], ["deviation", "Largest shortfall"]]);
//
// 			const count = $('<p class="eola-result-count" role="status" aria-live="polite"></p>').appendTo(panels.alerts);
// 			const list = $('<div class="eola-alert-list"></div>').appendTo(panels.alerts);
// 			search.on("input", () => { filters.search = search.val(); renderAlerts(); });
//
// 			const renderAlerts = () => {
// 				list.empty();
// 				const query = filters.search.trim().toLowerCase();
// 				const alerts = data.alerts.filter(alert =>
// 					(!filters.severity || alert.severity === filters.severity) &&
// 					(!filters.status || alert.status === filters.status) &&
// 					(!query || [alert.alert_name, alert.name, alert.installed_solar_system].join(" ").toLowerCase().includes(query))
// 				).sort((a, b) => {
// 					if (filters.sort === "priority") {
// 						const priority = Number(b.severity === "Critical") - Number(a.severity === "Critical");
// 						if (priority) return priority;
// 					}
// 					if (filters.sort === "deviation") return Number(a.deviation) - Number(b.deviation);
// 					return String(b.alert_date).localeCompare(String(a.alert_date));
// 				});
// 				count.text(__("{0} of {1} loaded alerts", [alerts.length, data.alerts.length]) + (data.alerts.length === 50 ? " · " + __("Latest 50 loaded. View all alerts for the full list.") : ""));
// 				if (!alerts.length) {
// 					emptyState(
// 						list,
// 						data.alerts.length ? "search" : "checkCircle",
// 						data.alerts.length ? __("No matching alerts") : __("No open performance alerts"),
// 						data.alerts.length ? __("Try another search or clear the filters.") : __("Refresh to check for new performance updates."),
// 						data.alerts.length ? __("Clear filters") : null,
// 						data.alerts.length ? () => {
// 							filters.search = filters.severity = filters.status = "";
// 							toolbar.find("input").val("");
// 							toolbar.find("#eola-severity, #eola-status").val("");
// 							renderAlerts();
// 							search.trigger("focus");
// 						} : null,
// 						"x"
// 					);
// 				}
// 				for (const [index, alert] of alerts.entries()) {
// 					const rec = alert.recommendation;
// 					const card = $('<article class="eola-alert"></article>').toggleClass("critical", alert.severity === "Critical").appendTo(list);
// 					const head = $('<div class="eola-alert-head"></div>').appendTo(card);
// 					const badges = $('<div class="eola-badges"></div>').appendTo(head);
// 					badge(badges, __(alert.severity), "eola-severity", alert.severity === "Critical" ? "alertOctagon" : "alertTriangle");
// 					badge(badges, alertLabel(alert.status), "", statusIcon(alert.status));
// 					if (alert.issue) badge(badges, __("Issue: {0}", [issueLabel(alert.issue.status)]), "", statusIcon(alert.issue.status));
// 					text("<h4>", alert.alert_name, head);
// 					text("<div>", alert.installed_solar_system, head, "eola-system");
// 					const stats = $('<div class="eola-stats"></div>').appendTo(head);
// 					stat(stats, "calendar", frappe.datetime.str_to_user(alert.alert_date));
// 					stat(stats, "activity", `${Number(alert.deviation).toFixed(1)}% ${__("vs expected")}`);
// 					stat(stats, "clock", `${Number((Number(alert.duration) / 3600).toFixed(1))} ${__("affected hours")}`);
// 					if (rec) {
// 						const findingWrap = $('<div class="eola-finding-wrap"></div>').appendTo(head);
// 						findingWrap.append(icon("info", "eola-finding-icon"));
// 						$('<p class="eola-finding"></p>').text(rec.finding).appendTo(findingWrap);
// 						const columnsId = `eola-alert-columns-${index}`;
// 						const columns = $('<div class="eola-columns" hidden></div>').attr("id", columnsId).appendTo(card);
// 						const toggle = button(head, "Show recommendation", () => {
// 							const expanded = toggle.attr("aria-expanded") !== "true";
// 							if (expanded) expandedAlerts.add(alert.name);
// 							else expandedAlerts.delete(alert.name);
// 							toggle.attr("aria-expanded", String(expanded));
// 							toggle.find("span").text(expanded ? __("Hide recommendation") : __("Show recommendation"));
// 							columns.prop("hidden", !expanded);
// 						}, "btn-default eola-details", "chevronDown");
// 						const expanded = expandedAlerts.has(alert.name);
// 						toggle.attr({ "aria-expanded": String(expanded), "aria-controls": columnsId });
// 						if (expanded) toggle.find("span").text(__("Hide recommendation"));
// 						columns.prop("hidden", !expanded);
// 						for (const [label, content, iconName] of [["Possible reasons", rec.possible_causes, "search"], ["Recommended actions", rec.recommended_action, "clipboard"]]) {
// 							const column = $("<section>").appendTo(columns);
// 							const h5 = $("<h5>").appendTo(column);
// 							h5.append(icon(iconName));
// 							$("<span>").text(__(label)).appendTo(h5);
// 							text("<div>", content || __("Not provided"), column, "eola-lines");
// 						}
// 						if (rec.technician_modification) note(card, "edit", `${__("Approved modified actions")}\n${rec.technician_modification}`);
// 						note(card, "info", rec.ai_disclaimer);
// 					} else text("<p>", __("No recommendation available to review."), head, "text-muted");
// 					const footer = $('<div class="eola-footer"></div>').appendTo(card);
// 					if (alert.issue) button(footer, "Open issue", () => frappe.set_route("Form", "ES Issue", alert.issue.name), "btn-default", "tool");
// 					button(footer, "Open recommendation", () => rec ? frappe.set_route("Form", "AI Recommendation", rec.name) : frappe.set_route("List", "AI Recommendation", { performance_alert: alert.name }), "btn-default", "clipboard");
// 					const actions = $('<div class="eola-actions"></div>').appendTo(footer);
// 					if (alert.can_review) {
// 						button(actions, "Accept", () => review(alert, "Accept"), "eola-accept", "check");
// 						button(actions, "Modify", () => review(alert, "Modify"), "btn-default", "edit");
// 						button(actions, "Reject", () => review(alert, "Reject"), "btn-default eola-reject", "x");
// 					} else if (rec) text("<span>", `${__("Decision")}: ${__(rec.technician_decision)}`, actions, "text-muted");
// 				}
// 			};
// 			renderAlerts();
// 		} catch (error) {
// 			body.empty();
// 			emptyState(body, "alertOctagon", null, __("Unable to load dashboard. Check your connection and permissions, then try again."), __("Try again"), refresh, "refresh").attr("role", "alert");
// 		} finally { loading = false; body.attr("aria-busy", "false"); }
// 	};
// 	page.set_primary_action(__("Refresh"), refresh);
// 	wrapper.eola_refresh = refresh;
// };
// frappe.pages["eola-dashboard"].on_page_show = (wrapper) => wrapper.eola_refresh();


frappe.pages["eola-dashboard"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({ parent: wrapper, title: __("EOLA Dashboard"), single_column: true });
	const body = $('<div class="eola-review-dashboard"></div>').appendTo(page.main);
	$(`<style>
	.eola-review-dashboard {
		--eola-radius:14px; --eola-radius-sm:10px;
		--eola-shadow:0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06);
		--eola-shadow-hover:0 6px 16px rgba(16,24,40,.10), 0 2px 6px rgba(16,24,40,.06);
		--eola-brand:#12766f; --eola-brand-dark:#0d5b55;
		padding:16px; max-width:1280px; margin:0 auto; color:var(--text-color);
	}
	.eola-review-dashboard .eola-icon { width:16px; height:16px; flex:0 0 auto; }
	.eola-review-dashboard .eola-icon-lg { width:30px; height:30px; margin:0 auto 8px; display:block; color:var(--text-muted); opacity:.75; }
	.eola-review-dashboard .eola-spin { animation:eola-spin 1s linear infinite; }
	@keyframes eola-spin { to { transform:rotate(360deg); } }

	.eola-review-dashboard .eola-hero { position:relative; overflow:hidden; background:linear-gradient(135deg,#0d2b33,#14746c 60%,#1c8f83); color:#fff; padding:18px 20px; border-radius:var(--eola-radius); margin-bottom:16px; }
	.eola-review-dashboard .eola-hero::after { content:""; position:absolute; right:-50px; top:-60px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,.08); }
	.eola-review-dashboard .eola-hero-icon { position:relative; width:36px; height:36px; border-radius:10px; background:rgba(255,255,255,.16); display:flex; align-items:center; justify-content:center; margin-bottom:8px; }
	.eola-review-dashboard .eola-hero-icon .eola-icon { width:20px; height:20px; }
	.eola-review-dashboard .eola-eyebrow { position:relative; text-transform:uppercase; letter-spacing:2px; font-size:11px; font-weight:700; opacity:.8; }
	.eola-review-dashboard .eola-hero h2 { position:relative; color:#fff; margin:4px 0 4px; font-size:22px; font-weight:700; }
	.eola-review-dashboard .eola-hero p { position:relative; margin:0; color:#d4ece8; max-width:560px; font-size:13px; }

	.eola-review-dashboard .eola-metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; margin-bottom:16px; }
	.eola-review-dashboard .eola-metric { border:1px solid var(--border-color); background:var(--card-bg); padding:12px; border-radius:var(--eola-radius-sm); box-shadow:var(--eola-shadow); transition:box-shadow .15s ease, transform .15s ease; text-align:left; }
	.eola-review-dashboard button.eola-metric { cursor:pointer; }
	.eola-review-dashboard button.eola-metric:hover { box-shadow:var(--eola-shadow-hover); transform:translateY(-2px); }
	.eola-review-dashboard .eola-metric-icon { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:6px; }
	.eola-review-dashboard .eola-metric span { display:block; color:var(--text-muted); font-size:12px; font-weight:500; }
	.eola-review-dashboard .eola-metric strong { display:block; font-size:22px; margin-top:2px; font-weight:700; }

	.eola-review-dashboard .eola-tabs { display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap; }
	.eola-review-dashboard .eola-tabs button { display:inline-flex; align-items:center; gap:5px; border:1px solid var(--border-color); background:var(--card-bg); padding:6px 12px; border-radius:999px; font-weight:600; font-size:12.5px; color:var(--text-muted); transition:all .15s ease; }
	.eola-review-dashboard .eola-tabs button:hover { border-color:var(--eola-brand); color:var(--eola-brand); }
	.eola-review-dashboard .eola-tabs button[aria-selected="true"] { background:var(--eola-brand); border-color:var(--eola-brand); color:#fff; }
	.eola-review-dashboard [role="tabpanel"][hidden] { display:none; }

	.eola-review-dashboard .eola-section { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:10px; flex-wrap:wrap; }
	.eola-review-dashboard .eola-section h3 { margin:0; display:flex; align-items:center; gap:6px; }

	.eola-review-dashboard .eola-toolbar { display:grid; grid-template-columns:minmax(200px,2fr) repeat(3,minmax(150px,1fr)); gap:10px; padding:10px; background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--eola-radius-sm); margin-bottom:12px; }
	.eola-review-dashboard .eola-toolbar label { display:block; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.4px; color:var(--text-muted); margin-bottom:4px; }
	.eola-review-dashboard .eola-toolbar .form-control { width:100%; min-height:32px; }
	.eola-review-dashboard .eola-issue-tools { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px; }
	.eola-review-dashboard .eola-issue-tools > label { flex:1; min-width:180px; display:block; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.4px; color:var(--text-muted); margin-bottom:4px; }

	.eola-review-dashboard .eola-search-wrap { position:relative; }
	.eola-review-dashboard .eola-search-wrap .eola-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--text-muted); width:15px; height:15px; }
	.eola-review-dashboard .eola-search-wrap input { padding-left:32px; }

	.eola-review-dashboard .eola-result-count { margin:0 0 10px; color:var(--text-muted); font-size:12.5px; }

	.eola-review-dashboard .eola-alert { background:var(--card-bg); border:1px solid var(--border-color); border-left:4px solid #d59628; border-radius:var(--eola-radius-sm); margin-bottom:10px; overflow:hidden; box-shadow:var(--eola-shadow); transition:box-shadow .15s ease, transform .15s ease; }
	.eola-review-dashboard .eola-alert:hover { box-shadow:var(--eola-shadow-hover); }
	.eola-review-dashboard .eola-alert.critical { border-left-color:#d64545; }
	.eola-review-dashboard .eola-alert-head { padding:12px 14px 10px; }
	.eola-review-dashboard .eola-badges { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; }
	.eola-review-dashboard .eola-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:20px; background:var(--control-bg); font-size:11.5px; font-weight:600; }
	.eola-review-dashboard .eola-badge .eola-icon { width:11px; height:11px; }
	.eola-review-dashboard .eola-severity { background:#fff3d6; color:#8a5a06; }
	.eola-review-dashboard .critical .eola-severity { background:#fde2e2; color:#a1282f; }
	.eola-review-dashboard h4 { font-size:16px; margin:0 0 6px; line-height:1.35; overflow-wrap:anywhere; }
	.eola-review-dashboard .eola-system { margin-bottom:6px; color:var(--text-muted); font-size:12.5px; }
	.eola-review-dashboard .eola-stats { display:flex; gap:14px; flex-wrap:wrap; color:var(--text-muted); font-size:12.5px; }
	.eola-review-dashboard .eola-stats > span { display:inline-flex; align-items:center; gap:4px; }
	.eola-review-dashboard .eola-field-line { display:flex; align-items:center; gap:5px; margin:5px 0 0; font-size:12.5px; color:var(--text-color); }
	.eola-review-dashboard .eola-field-line .eola-icon { color:var(--text-muted); }

	.eola-review-dashboard .eola-finding-wrap { display:flex; gap:6px; align-items:flex-start; margin-top:8px; }
	.eola-review-dashboard .eola-finding-icon { width:14px; height:14px; margin-top:2px; color:var(--eola-brand); }
	.eola-review-dashboard .eola-finding { margin:0; line-height:1.5; }

	.eola-review-dashboard .eola-details { margin-top:8px; display:inline-flex; align-items:center; gap:5px; }
	.eola-review-dashboard .eola-details .eola-icon { transition:transform .15s ease; }
	.eola-review-dashboard .eola-details[aria-expanded="true"] .eola-icon { transform:rotate(180deg); }

	.eola-review-dashboard .eola-columns { display:grid; grid-template-columns:1fr 1fr; gap:14px; padding:12px 14px; border-top:1px solid var(--border-color); }
	.eola-review-dashboard .eola-columns[hidden] { display:none; }
	.eola-review-dashboard .eola-columns h5 { display:flex; align-items:center; gap:5px; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin:0 0 8px; }
	.eola-review-dashboard .eola-lines { white-space:pre-wrap; line-height:1.6; font-size:12.5px; overflow-wrap:anywhere; }

	.eola-review-dashboard .eola-note { display:flex; align-items:flex-start; gap:6px; padding:8px 0 0; color:var(--text-muted); font-size:11.5px; grid-column:1 / -1; }
	.eola-review-dashboard .eola-note .eola-icon { width:13px; height:13px; margin-top:2px; }

	.eola-review-dashboard .eola-footer { padding:10px 14px; background:var(--subtle-fg); display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; border-top:1px solid var(--border-color); }
	.eola-review-dashboard .eola-actions { display:flex; gap:6px; flex-wrap:wrap; }
	.eola-review-dashboard .btn { display:inline-flex; align-items:center; gap:5px; min-height:30px; }
	.eola-review-dashboard .eola-accept { background:var(--eola-brand); color:#fff; border-color:var(--eola-brand); }
	.eola-review-dashboard .eola-accept:hover { background:var(--eola-brand-dark); color:#fff; }
	.eola-review-dashboard .eola-reject { color:var(--red-600); }
	.eola-review-dashboard .eola-reject:hover { background:#fde2e2; }

	.eola-review-dashboard .eola-empty { padding:24px 16px; text-align:center; border:1px dashed var(--border-color); border-radius:var(--eola-radius-sm); color:var(--text-muted); }
	.eola-review-dashboard .eola-empty h4 { margin:0 0 4px; color:var(--text-color); }
	.eola-review-dashboard p.text-muted { margin:0 0 10px; font-size:12.5px; }

	.eola-review-dashboard :is(button,input,select,a):focus-visible { outline:2px solid var(--primary); outline-offset:3px; }

	@media(max-width:900px) { .eola-review-dashboard .eola-metrics { grid-template-columns:repeat(2,1fr); } .eola-review-dashboard .eola-columns { grid-template-columns:1fr; } .eola-review-dashboard .eola-toolbar { grid-template-columns:1fr 1fr; } }
	@media(max-width:540px) { .eola-review-dashboard { padding:8px; } .eola-review-dashboard .eola-hero { padding:14px; } .eola-review-dashboard .eola-alert-head,.eola-review-dashboard .eola-columns,.eola-review-dashboard .eola-footer { padding:10px; } .eola-review-dashboard .eola-toolbar { grid-template-columns:1fr; } .eola-review-dashboard .eola-metric { padding:10px; } }
	</style>`).appendTo(page.main);

	// ---------- Icon set (inline SVG, no external dependency) ----------
	const ICONS = {
		sun: '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>',
		activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',
		alertTriangle: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
		alertOctagon: '<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
		search: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
		tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>',
		check: '<polyline points="20 6 9 17 4 12"></polyline>',
		edit: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>',
		x: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
		externalLink: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>',
		refresh: '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>',
		calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
		clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
		chevronDown: '<polyline points="6 9 12 15 18 9"></polyline>',
		list: '<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>',
		inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>',
		info: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
		checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
		clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>',
		flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>',
	};
	const icon = (name, cls = "") => `<svg class="eola-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
	const statusIcon = status => ({
		"New Alert": "alertTriangle", "Under Review": "search", "Confirmed": "checkCircle",
		"Scheduled": "calendar", "Re-scheduled": "calendar", "In Progress": "tool",
		"On Hold": "clock", "Resolved": "checkCircle", "Closed": "checkCircle", "Dismissed": "x",
	}[status] || "info");

	// ---------- DOM helpers ----------
	const text = (tag, value, parent, cls) => $(tag).addClass(cls || "").text(value || "").appendTo(parent);
	const button = (parent, label, handler, cls = "btn-default", iconName) => {
		const btn = $('<button type="button" class="btn btn-sm"></button>').addClass(cls).on("click", handler).appendTo(parent);
		if (iconName) btn.append(icon(iconName));
		$("<span>").text(__(label)).appendTo(btn);
		return btn;
	};
	const badge = (parent, label, cls, iconName) => {
		const el = $('<span class="eola-badge"></span>').addClass(cls || "").appendTo(parent);
		if (iconName) el.append(icon(iconName));
		$("<span>").text(label).appendTo(el);
		return el;
	};
	const stat = (parent, iconName, value) => {
		const el = $("<span></span>").appendTo(parent);
		el.append(icon(iconName));
		$("<span>").text(value).appendTo(el);
	};
	const fieldLine = (parent, iconName, value) => {
		const p = $('<p class="eola-field-line"></p>').appendTo(parent);
		p.append(icon(iconName));
		$("<span>").text(value).appendTo(p);
	};
	const note = (parent, iconName, content) => {
		const el = $('<div class="eola-note"></div>').appendTo(parent);
		el.append(icon(iconName));
		$('<div class="eola-lines"></div>').text(content).appendTo(el);
	};
	const emptyState = (parent, iconName, title, body_, actionLabel, actionHandler, actionIcon) => {
		const el = $('<div class="eola-empty"></div>').appendTo(parent);
		el.append(icon(iconName, "eola-icon-lg"));
		if (title) text("<h4>", title, el);
		if (body_) text("<p>", body_, el);
		if (actionLabel) button(el, actionLabel, actionHandler, "btn-default", actionIcon);
		return el;
	};

	const review = (alert, decision) => {
		const dialog = new frappe.ui.Dialog({
			title: __("{0} Recommendation", [decision]),
			fields: [
				{ fieldname: "modification", label: __("Modified Actions"), fieldtype: "Long Text", reqd: decision === "Modify", hidden: decision !== "Modify", default: decision === "Modify" ? alert.recommendation.recommended_action : "" },
				{ fieldname: "remarks", label: __("Technician Remarks"), fieldtype: "Long Text", reqd: decision === "Reject" },
			],
			primary_action_label: __("Confirm {0}", [decision]),
			async primary_action(values) {
				dialog.get_primary_btn().prop("disabled", true);
				try {
					await frappe.call({ method: "eola.api.review_recommendation", args: { name: alert.recommendation.name, decision, ...values }, freeze: true });
					dialog.hide();
					frappe.show_alert({ message: __("Review saved"), indicator: "green" });
					await refresh();
				} finally {
					dialog.get_primary_btn().prop("disabled", false);
				}
			},
		});
		dialog.show();
	};

	const filters = { search: "", severity: "", status: "", sort: "priority" };
	let activeTab = "alerts";
	const issueFilters = { search: "", status: "" };
	const issueLabel = status => ({ "New Alert": __("Needs Review"), "Confirmed": __("Awaiting Scheduling") }[status] || __(status));
	const alertLabel = status => status === "Confirmed" ? __("Approved · service pending") : __(status);
	const activeIssueStatuses = ["Confirmed", "Scheduled", "Re-scheduled", "In Progress", "On Hold"];
	const expandedAlerts = new Set();
	let loading = false;

	const refresh = async () => {
		if (loading) return;
		loading = true;
		body.empty();
		body.attr("aria-busy", "true");
		emptyState(body, "refresh", null, __("Loading solar performance…")).attr("role", "status");
		body.find(".eola-icon-lg").addClass("eola-spin");
		try {
			const { message: data } = await frappe.call("eola.api.dashboard");
			body.empty();

			const hero = $('<header class="eola-hero"></header>').appendTo(body);
			$('<div class="eola-hero-icon"></div>').html(icon("sun")).appendTo(hero);
			text("<div>", __("EOLA · Performance monitoring"), hero, "eola-eyebrow");
			text("<h2>", __("Solar performance overview"), hero);
			text("<p>", __("Review solar performance, assess possible causes and approve the next steps."), hero);

			const metrics = $('<div class="eola-metrics"></div>').appendTo(body);
			const metricDefs = [
				["Systems Monitored", data.systems_monitored, "sun", "#e3f6f4", "#0f6f68"],
				["Alerts Today", data.alerts_today, "alertTriangle", "#fff1e0", "#b45309"],
				["Systems Needing Review", data.systems_needing_review, "search", "#e8f0fe", "#1d4ed8"],
				["Maintenance Cases", data.maintenance_cases, "tool", "#f3e8ff", "#7e22ce"],
			];
			for (const [label, value, iconName, bg, fg] of metricDefs) {
				const card = $(label === "Maintenance Cases" ? '<button type="button" class="eola-metric"></button>' : '<div class="eola-metric"></div>').appendTo(metrics);
				if (label === "Maintenance Cases") card.on("click", () => { issueFilters.status = "active"; issueFilters.search = ""; issueSearch.val(""); issueStatus.val("active"); renderIssues(); switchTab("issues", true); });
				$('<div class="eola-metric-icon"></div>').css({ background: bg, color: fg }).html(icon(iconName)).appendTo(card);
				text("<span>", __(label), card);
				text("<strong>", String(value), card);
			}

			const tabs = $('<div class="eola-tabs" role="tablist"></div>').attr("aria-label", __("Dashboard views")).appendTo(body);
			const panels = {};
			const tabButtons = {};
			const switchTab = (key, focus = false) => {
				activeTab = key;
				for (const name of ["alerts", "issues"]) {
					panels[name].prop("hidden", name !== key);
					tabButtons[name].attr({ "aria-selected": String(name === key), tabindex: name === key ? "0" : "-1" });
				}
				if (focus) tabButtons[key].trigger("focus");
			};
			for (const [key, label, iconName] of [["alerts", "Performance Alerts", "alertTriangle"], ["issues", "Issue List", "list"]]) {
				tabButtons[key] = button(tabs, label, () => switchTab(key), "btn-default", iconName).attr({ role: "tab", id: `eola-tab-${key}`, "aria-controls": `eola-panel-${key}` });
				panels[key] = $('<section role="tabpanel"></section>').attr({ id: `eola-panel-${key}`, "aria-labelledby": `eola-tab-${key}` }).appendTo(body);
				tabButtons[key].on("keydown", event => {
					if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
						event.preventDefault();
						switchTab(event.key === "Home" ? "alerts" : event.key === "End" ? "issues" : key === "alerts" ? "issues" : "alerts", true);
					}
				});
			}

			// ---------- Issues panel ----------
			const issueHeading = $('<div class="eola-section"></div>').appendTo(panels.issues);
			$("<h3>").html(icon("list")).append($("<span>").text(__("Issue List"))).appendTo(issueHeading);
			button(issueHeading, "View all issues", () => frappe.set_route("List", "ES Issue"), "btn-default", "externalLink");
			text("<p>", __("Technician approval authorizes service. An issue remains open until its resolution is recorded."), panels.issues, "text-muted");

			const issueTools = $('<div class="eola-issue-tools"></div>').appendTo(panels.issues);
			const issueSearchLabel = text("<label>", __("Search issues"), issueTools);
			const issueSearchWrap = $('<div class="eola-search-wrap"></div>').appendTo(issueSearchLabel);
			issueSearchWrap.append(icon("search", "eola-search-icon"));
			const issueSearch = $('<input type="search" class="form-control">').attr("placeholder", __("Issue, alert or solar system…")).val(issueFilters.search).appendTo(issueSearchWrap);
			const issueStatusLabel = text("<label>", __("Issue status"), issueTools);
			const issueStatus = $('<select class="form-control"></select>').appendTo(issueStatusLabel);
			for (const [value, label] of [["", __("All statuses")], ["active", __("Active maintenance cases")], ...["New Alert", "Confirmed", "Scheduled", "Re-scheduled", "In Progress", "On Hold", "Resolved", "Closed", "Dismissed"].map(status => [status, issueLabel(status)])]) text("<option>", label, issueStatus).val(value);
			issueStatus.val(issueFilters.status);

			const issueCount = $('<p role="status" aria-live="polite" class="eola-result-count"></p>').appendTo(panels.issues);
			const issueList = $("<div>").appendTo(panels.issues);
			const renderIssues = () => {
				issueList.empty();
				const query = issueFilters.search.trim().toLowerCase();
				const issues = (data.issues || []).filter(issue => (!issueFilters.status || (issueFilters.status === "active" ? activeIssueStatuses.includes(issue.status) : issue.status === issueFilters.status)) && [issue.name, issue.subject, issue.performance_alert, issue.installed_solar_system].join(" ").toLowerCase().includes(query));
				issueCount.text(__("{0} issues", [issues.length]));
				if (!issues.length) {
					emptyState(issueList, "inbox", null, __("No issues match this view. Select all statuses or clear your search."), __("Show all issues"), () => { issueFilters.search = issueFilters.status = ""; issueSearch.val(""); issueStatus.val(""); renderIssues(); }, "refresh");
				}
				for (const issue of issues) {
					const card = $('<article class="eola-alert"></article>').appendTo(issueList);
					const head = $('<div class="eola-alert-head"></div>').appendTo(card);
					const badges = $('<div class="eola-badges"></div>').appendTo(head);
					badge(badges, issueLabel(issue.status), "", statusIcon(issue.status));
					badge(badges, __("Priority: {0}", [__(issue.priority)]), "", "flag");
					text("<h4>", issue.subject, head);
					text("<p>", [issue.name, issue.installed_solar_system, issue.service_type && __(issue.service_type)].filter(Boolean).join(" · "), head, "eola-system");
					if (issue.scheduled_date) fieldLine(head, "calendar", __("Scheduled: {0}", [frappe.datetime.str_to_user(issue.scheduled_date)]));
					if (issue.status === "Re-scheduled" && issue.reschedule_reason) fieldLine(head, "alertTriangle", issue.reschedule_reason);
					if (issue.resolved_date) fieldLine(head, "checkCircle", __("Resolved: {0}", [frappe.datetime.str_to_user(issue.resolved_date)]));
					const actions = $('<div class="eola-footer"></div>').appendTo(card);
					button(actions, "Open issue", () => frappe.set_route("Form", "ES Issue", issue.name), "btn-default", "tool");
					if (issue.performance_alert) button(actions, "View linked alert", () => frappe.set_route("Form", "Performance Alert", issue.performance_alert), "btn-default", "externalLink");
				}
			};
			issueSearch.on("input", () => { issueFilters.search = issueSearch.val(); renderIssues(); });
			issueStatus.on("change", () => { issueFilters.status = issueStatus.val(); renderIssues(); });
			renderIssues();
			switchTab(activeTab);

			// ---------- Alerts panel ----------
			const heading = $('<div class="eola-section"></div>').appendTo(panels.alerts);
			$("<h3>").html(icon("alertTriangle")).append($("<span>").text(__("Performance alerts"))).appendTo(heading);
			button(heading, "View all alerts", () => frappe.set_route("List", "Performance Alert"), "btn-default", "externalLink");

			const toolbar = $('<div class="eola-toolbar"></div>').appendTo(panels.alerts);
			const searchField = $("<div>").appendTo(toolbar);
			text("<label>", __("Search alerts"), searchField).attr("for", "eola-search");
			const searchWrap = $('<div class="eola-search-wrap"></div>').appendTo(searchField);
			searchWrap.append(icon("search", "eola-search-icon"));
			const search = $('<input type="search" id="eola-search" class="form-control">').attr("placeholder", __("Alert or solar system…")).val(filters.search).appendTo(searchWrap);
			const select = (key, label, options) => {
				const field = $("<div>").appendTo(toolbar);
				text("<label>", __(label), field).attr("for", `eola-${key}`);
				const input = $('<select class="form-control"></select>').attr("id", `eola-${key}`).appendTo(field);
				for (const [value, title] of options) text("<option>", __(title), input).val(value);
				return input.val(filters[key]).on("change", () => { filters[key] = input.val(); renderAlerts(); });
			};
			select("severity", "Severity", [["", "All severities"], ["Critical", "Critical"], ["Warning", "Warning"]]);
			select("status", "Status", [["", "All statuses"], ["New Alert", "New Alert"], ["Under Review", "Under Review"], ["Confirmed", "Approved · service pending"]]);
			select("sort", "Sort by", [["priority", "Critical first"], ["newest", "Newest first"], ["deviation", "Largest shortfall"]]);

			const count = $('<p class="eola-result-count" role="status" aria-live="polite"></p>').appendTo(panels.alerts);
			const list = $('<div class="eola-alert-list"></div>').appendTo(panels.alerts);
			search.on("input", () => { filters.search = search.val(); renderAlerts(); });

			const renderAlerts = () => {
				list.empty();
				const query = filters.search.trim().toLowerCase();
				const alerts = data.alerts.filter(alert =>
					(!filters.severity || alert.severity === filters.severity) &&
					(!filters.status || alert.status === filters.status) &&
					(!query || [alert.alert_name, alert.name, alert.installed_solar_system].join(" ").toLowerCase().includes(query))
				).sort((a, b) => {
					if (filters.sort === "priority") {
						const priority = Number(b.severity === "Critical") - Number(a.severity === "Critical");
						if (priority) return priority;
					}
					if (filters.sort === "deviation") return Number(a.deviation) - Number(b.deviation);
					return String(b.alert_date).localeCompare(String(a.alert_date));
				});
				count.text(__("{0} of {1} loaded alerts", [alerts.length, data.alerts.length]) + (data.alerts.length === 50 ? " · " + __("Latest 50 loaded. View all alerts for the full list.") : ""));
				if (!alerts.length) {
					emptyState(
						list,
						data.alerts.length ? "search" : "checkCircle",
						data.alerts.length ? __("No matching alerts") : __("No open performance alerts"),
						data.alerts.length ? __("Try another search or clear the filters.") : __("Refresh to check for new performance updates."),
						data.alerts.length ? __("Clear filters") : null,
						data.alerts.length ? () => {
							filters.search = filters.severity = filters.status = "";
							toolbar.find("input").val("");
							toolbar.find("#eola-severity, #eola-status").val("");
							renderAlerts();
							search.trigger("focus");
						} : null,
						"x"
					);
				}
				for (const [index, alert] of alerts.entries()) {
					const rec = alert.recommendation;
					const card = $('<article class="eola-alert"></article>').toggleClass("critical", alert.severity === "Critical").appendTo(list);
					const head = $('<div class="eola-alert-head"></div>').appendTo(card);
					const badges = $('<div class="eola-badges"></div>').appendTo(head);
					badge(badges, __(alert.severity), "eola-severity", alert.severity === "Critical" ? "alertOctagon" : "alertTriangle");
					badge(badges, alertLabel(alert.status), "", statusIcon(alert.status));
					if (alert.issue) badge(badges, __("Issue: {0}", [issueLabel(alert.issue.status)]), "", statusIcon(alert.issue.status));
					text("<h4>", alert.alert_name, head);
					text("<div>", alert.installed_solar_system, head, "eola-system");
					const stats = $('<div class="eola-stats"></div>').appendTo(head);
					stat(stats, "calendar", frappe.datetime.str_to_user(alert.alert_date));
					stat(stats, "activity", `${Number(alert.deviation).toFixed(1)}% ${__("vs expected")}`);
					stat(stats, "clock", `${Number((Number(alert.duration) / 3600).toFixed(1))} ${__("affected hours")}`);
					if (rec) {
						const findingWrap = $('<div class="eola-finding-wrap"></div>').appendTo(head);
						findingWrap.append(icon("info", "eola-finding-icon"));
						$('<p class="eola-finding"></p>').text(rec.finding).appendTo(findingWrap);
						const columnsId = `eola-alert-columns-${index}`;
						const columns = $('<div class="eola-columns" hidden></div>').attr("id", columnsId).appendTo(card);
						const toggle = button(head, "Show recommendation", () => {
							const expanded = toggle.attr("aria-expanded") !== "true";
							if (expanded) expandedAlerts.add(alert.name);
							else expandedAlerts.delete(alert.name);
							toggle.attr("aria-expanded", String(expanded));
							toggle.find("span").text(expanded ? __("Hide recommendation") : __("Show recommendation"));
							columns.prop("hidden", !expanded);
						}, "btn-default eola-details", "chevronDown");
						const expanded = expandedAlerts.has(alert.name);
						toggle.attr({ "aria-expanded": String(expanded), "aria-controls": columnsId });
						if (expanded) toggle.find("span").text(__("Hide recommendation"));
						columns.prop("hidden", !expanded);
						for (const [label, content, iconName] of [["Possible reasons", rec.possible_causes, "search"], ["Recommended actions", rec.recommended_action, "clipboard"]]) {
							const column = $("<section>").appendTo(columns);
							const h5 = $("<h5>").appendTo(column);
							h5.append(icon(iconName));
							$("<span>").text(__(label)).appendTo(h5);
							text("<div>", content || __("Not provided"), column, "eola-lines");
						}
						if (rec.technician_modification) note(columns, "edit", `${__("Approved modified actions")}\n${rec.technician_modification}`);
						note(columns, "info", rec.ai_disclaimer);
					} else text("<p>", __("No recommendation available to review."), head, "text-muted");
					const footer = $('<div class="eola-footer"></div>').appendTo(card);
					if (alert.issue) button(footer, "Open issue", () => frappe.set_route("Form", "ES Issue", alert.issue.name), "btn-default", "tool");
					button(footer, "Open recommendation", () => rec ? frappe.set_route("Form", "AI Recommendation", rec.name) : frappe.set_route("List", "AI Recommendation", { performance_alert: alert.name }), "btn-default", "clipboard");
					const actions = $('<div class="eola-actions"></div>').appendTo(footer);
					if (alert.can_review) {
						button(actions, "Accept", () => review(alert, "Accept"), "eola-accept", "check");
						button(actions, "Modify", () => review(alert, "Modify"), "btn-default", "edit");
						button(actions, "Reject", () => review(alert, "Reject"), "btn-default eola-reject", "x");
					} else if (rec) text("<span>", `${__("Decision")}: ${__(rec.technician_decision)}`, actions, "text-muted");
				}
			};
			renderAlerts();
		} catch (error) {
			body.empty();
			emptyState(body, "alertOctagon", null, __("Unable to load dashboard. Check your connection and permissions, then try again."), __("Try again"), refresh, "refresh").attr("role", "alert");
		} finally { loading = false; body.attr("aria-busy", "false"); }
	};
	page.set_primary_action(__("Refresh"), refresh);
	wrapper.eola_refresh = refresh;
};
frappe.pages["eola-dashboard"].on_page_show = (wrapper) => wrapper.eola_refresh();