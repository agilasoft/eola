frappe.pages["customer-inquiry"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({ parent: wrapper, title: __("Customer Inquiry"), single_column: true });
	page.add_inner_button(__("Customer Leads"), () => frappe.set_route("List", "Customer Lead"));
	const root = $('<div class="eola-inquiry"></div>').appendTo(page.main);
	$(`<style>
	.eola-inquiry { max-width:1080px; margin:auto; padding:12px; color:var(--text-color); }
	.eola-inquiry .hero { position:relative; overflow:hidden; background:linear-gradient(135deg,#0d2b33,#14746c 60%,#1c8f83); padding:24px; border-radius:12px; color:white; margin-bottom:18px; }
	.eola-inquiry .hero:after { content:""; position:absolute; width:200px; height:200px; border-radius:50%; background:#ffffff12; right:-50px; top:-80px; pointer-events:none; }
	.eola-inquiry .hero h2 { color:white; font-size:24px; margin:8px 0; }
	.eola-inquiry .hero p { color:#d4ece8; max-width:760px; margin:0; line-height:1.65; }
	.eola-inquiry .eyebrow { font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:700; }
	.eola-inquiry .steps { display:flex; gap:12px; padding:0; list-style:none; margin:0 0 18px; }
	.eola-inquiry .steps li { flex:1; padding:12px; border-bottom:3px solid var(--border-color); color:var(--text-muted); }
	.eola-inquiry .steps [aria-current="step"] { border-color:#14746c; color:var(--text-color); font-weight:700; }
	.eola-inquiry .card { background:var(--card-bg); border:1px solid var(--border-color); border-radius:12px; padding:24px; margin-bottom:16px; }
	.eola-inquiry .card h3 { font-size:18px; margin:0 0 8px; }
	.eola-inquiry .grid { display:grid; grid-template-columns:1fr 1fr; gap:0 24px; }
	.eola-inquiry .wide { grid-column:1 / -1; }
	.eola-inquiry .actions { display:flex; gap:12px; align-items:center; justify-content:space-between; margin-top:20px; }
	.eola-inquiry .primary { background:#14746c; border-color:#14746c; color:white; }
	.eola-inquiry .primary:hover { background:#105b55; }
	.eola-inquiry .privacy { font-size:12px; line-height:1.7; color:var(--text-muted); }
	.eola-inquiry .notice { padding:14px; border-radius:8px; background:var(--control-bg); line-height:1.7; margin-bottom:16px; }
	.eola-inquiry .metrics { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:16px 0; }
	.eola-inquiry .metric { border:1px solid var(--border-color); border-radius:10px; padding:16px; }
	.eola-inquiry .metric span { display:block; font-size:12px; color:var(--text-muted); }
	.eola-inquiry .metric strong { display:block; font-size:22px; margin-top:6px; }
	.eola-inquiry .narrative { white-space:pre-wrap; line-height:1.7; overflow-wrap:anywhere; }
	.eola-inquiry .equipment { width:100%; border-collapse:collapse; }
	.eola-inquiry .equipment td,.eola-inquiry .equipment th { padding:12px; border-bottom:1px solid var(--border-color); text-align:left; vertical-align:top; }
	.eola-inquiry [hidden] { display:none !important; }
	.eola-inquiry :is(button,a,input,select,textarea):focus-visible { outline:2px solid #14746c; outline-offset:3px; }
	@media(max-width:600px) { .eola-inquiry .grid,.eola-inquiry .metrics { grid-template-columns:1fr; } .eola-inquiry .card { padding:16px; } .eola-inquiry .steps { gap:4px; font-size:12px; } .eola-inquiry .steps li { padding:8px 4px; } }
	</style>`).appendTo(page.main);
	const text = (tag, value, parent, cls = "") => $(tag).addClass(cls).text(__(value)).appendTo(parent);
	const btn = (parent, label, fn, cls = "btn-default") => $('<button type="button" class="btn"></button>').addClass(cls).text(__(label)).on("click", fn).appendTo(parent);
	const hero = $('<header class="hero"></header>').appendTo(root);
	text("<div>", "EOLA · Your solar journey", hero, "eyebrow");
	text("<h2>", "Let’s find your solar setup", hero);
	text("<p>", "Share your details with EOLA so our team can help you plan your solar setup. Your inquiry is saved in our ERP.", hero);
	const wizard = $("<div>").appendTo(root);
	const steps = $('<ol class="steps" aria-label="Inquiry progress"></ol>').appendTo(wizard);
	const titles = ["Contact details", "Your property", "Energy goals & budget"];
	const markers = titles.map((title, i) => text("<li>", `${i + 1}. ${title}`, steps));
	const controls = {}, sections = [];
	let step = 0, busy = false, lead = null;
	const newSubmissionId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, "0")).join("");
	let submissionId = newSubmissionId();
	function field(parent, name, label, type = "Data", options = {}) {
		const holder = $("<div>").toggleClass("wide", !!options.wide).appendTo(parent);
		const df = { fieldname: name, label: __(label), fieldtype: type, ...options };
		controls[name] = frappe.ui.form.make_control({ parent: holder, df, render_input: true });
		if (options.default !== undefined) controls[name].set_value(options.default);
		return controls[name];
	}
	for (const title of titles) {
		const section = $('<section class="card"></section>').appendTo(wizard);
		text('<h3 tabindex="-1">', title, section);
		sections.push(section);
	}
	text("<p>", "Tell us how to reach you. Fields marked * are required.", sections[0], "text-muted");
	const contact = $('<div class="grid"></div>').appendTo(sections[0]);
	field(contact, "first_name", "First name", "Data", { reqd: 1 });
	field(contact, "last_name", "Last name", "Data", { reqd: 1 });
	field(contact, "phone", "Phone number", "Data", { reqd: 1, default: "+63", description: "🇵🇭 Philippines +63 · Include your country code." });
	field(contact, "email", "Email", "Data", { reqd: 1, options: "Email" });
	field(contact, "country", "Country", "Link", { reqd: 1, options: "Country", default: "Philippines" });
	field(contact, "full_address", "Full address", "Small Text", { wide: true });
	text("<p>", "Help us understand your property and roof.", sections[1], "text-muted");
	const property = $('<div class="grid"></div>').appendTo(sections[1]);
	field(property, "property_type", "Property type", "Select", { reqd: 1, options: "\nResidential\nCommercial\nIndustrial\nAgricultural\nOther" });
	field(property, "ownership_status", "Ownership status", "Select", { options: "\nOwner\nTenant\nOther" });
	field(property, "roof_type", "Roof type", "Select", { options: "\nMetal\nTile\nConcrete\nAsphalt shingle\nOther\nNot sure" });
	field(property, "roof_shading", "Shading on roof", "Select", { options: "\nNone\nLight\nModerate\nHeavy\nNot sure" });
	field(property, "roof_age", "Roof age", "Float", { description: "Approximate years", non_negative: 1 });
	field(property, "roof_area", "Usable roof area (m²)", "Float", { non_negative: 1, description: "Optional. Available area after setbacks and obstructions; leave blank if unknown." });
	text("<p>", "Set your budget and savings goal. All amounts are in Philippine pesos (PHP), regardless of country.", sections[2], "text-muted");
	const energy = $('<div class="grid"></div>').appendTo(sections[2]);
	field(energy, "monthly_bill", "Average monthly electricity bill (PHP)", "Currency", { reqd: 1, options: "PHP" });
	field(energy, "electricity_provider", "Current electricity provider");
	field(energy, "allocated_budget", "Allocated budget (PHP)", "Currency", { reqd: 1, options: "PHP" });
	field(energy, "desired_reduction", "Desired bill reduction (%)", "Percent", { reqd: 1, default: 50 });
	field(energy, "electricity_rate", "Electricity rate (PHP/kWh)", "Float", { reqd: 1, default: 12, description: "Planning assumption — replace with the rate on your electricity bill." });
	const goalPreview = $('<div class="notice wide" aria-live="polite"></div>').appendTo(energy);
	const updateGoal = () => {
		const bill = Number(controls.monthly_bill.get_value() || 0), percent = Number(controls.desired_reduction.get_value() || 0);
		goalPreview.text(__("Your goal: save PHP {0}/month, for a remaining bill of PHP {1}/month.", [(bill * percent / 100).toFixed(2), (bill * (1 - percent / 100)).toFixed(2)]));
	};
	for (const key of ["monthly_bill", "desired_reduction"]) controls[key].$input.on("input change", updateGoal);
	updateGoal();
	text("<h4>", "Reason for interest in solar", energy, "wide");
	for (const [name, label] of [["reduce_costs", "Reduce energy costs"], ["environment", "Environmental concerns"], ["independence", "Energy independence"], ["property_value", "Increase property value"], ["other_reason", "Other"]]) field(energy, name, label, "Check");
	field(energy, "reason_details", "Other reason details", "Small Text", { wide: true });
	field(energy, "grid_connection", "Grid connection", "Select", { options: "Connected\nNo grid connection", default: "Connected", reqd: 1 });
	field(energy, "backup_required", "I would like battery backup during outages", "Check");
	field(energy, "installation_timeline", "Timeline for installation", "Select", { options: "\nAs soon as possible\nWithin 3 months\n3–6 months\n6–12 months\nJust exploring" });
	field(energy, "comments", "Additional comments or questions", "Small Text", { wide: true });
	const privacy = $('<div class="privacy"></div>').appendTo(sections[2]);
	text("<p>", "EOLA is committed to protecting and respecting your privacy, and we’ll only use your personal information to administer your account and to provide the products and services you requested from us. From time to time, we would like to contact you about our products and services, as well as other content that may be of interest to you. If you consent to us contacting you for this purpose, please tick below to say how you would like us to contact you:", privacy);
	field(privacy, "marketing_consent", "I agree to receive other communications from EOLA.", "Check");
	text("<p>", "You may unsubscribe from EOLA communications at any time by contacting our team.", privacy);
	text("<p>", "By clicking submit below, you consent to allow EOLA to store and process the personal information submitted above to provide you the content requested.", privacy);
	field(privacy, "processing_consent", "I consent to the storage and processing of my inquiry.", "Check", { reqd: 1 });
	const status = $('<p role="status" aria-live="polite"></p>').appendTo(wizard);
	wizard.on("input change", "input,select,textarea", () => status.empty().attr("role", "status"));
	const actions = $('<div class="actions"></div>').appendTo(wizard);
	const previous = btn(actions, "← Previous", () => showStep(step - 1));
	const next = btn(actions, "Next →", async () => {
		if (busy || !validate(step)) return;
		if (step < 2) return showStep(step + 1);
		await submit();
	}, "primary");
	next.css("margin-left", "auto");
	const result = $('<section hidden></section>').appendTo(root);
	function showStep(value) {
		step = value;
		sections.forEach((section, i) => section.prop("hidden", i !== step));
		markers.forEach((marker, i) => marker.attr("aria-current", i === step ? "step" : "false"));
		previous.prop("hidden", step === 0);
		next.text(__(step === 2 ? "Submit & see my solar setup" : "Next →"));
		sections[step].find("h3").trigger("focus");
	}
	function validate(index) {
		for (const [name, control] of Object.entries(controls)) {
			if (!sections[index][0].contains(control.$wrapper[0])) continue;
			const value = control.get_value();
			let error = control.df.reqd && !value ? __("{0} is required.", [control.df.label]) : "";
			if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = __("Enter a valid email address.");
			if (name === "phone" && (!/^\+?[0-9 ()-]{7,25}$/.test(value || "") || (value.match(/\d/g) || []).length > 15)) error = __("Enter a valid phone number including country code.");
			const bounds = { monthly_bill: [.01, 1e8], allocated_budget: [.01, 1e9], electricity_rate: [.01, 1000], desired_reduction: [.01, 100], roof_age: [0, 200], roof_area: [0, 1000000] }[name];
			if (bounds && (!Number.isFinite(Number(value)) || Number(value) < bounds[0] || Number(value) > bounds[1])) error = __("{0} must be between {1} and {2}.", [control.df.label, ...bounds]);
			if (error) { status.text(error).attr("role", "alert"); control.$input.trigger("focus"); return false; }
		}
		status.empty().attr("role", "status");
		return true;
	}
	async function submit() {
		busy = true;
		previous.prop("disabled", true); next.prop("disabled", true);
		status.text(__(lead ? "Lead saved. Preparing your solar recommendation…" : "Saving your inquiry…"));
		try {
			if (!lead) {
				const data = Object.fromEntries(Object.entries(controls).map(([key, control]) => [key, control.get_value()]));
				const response = await frappe.call({ method: "eola.customer_inquiry.submit_inquiry", args: { data, submission_id: submissionId } });
				lead = response.message.name;
				// Freeze the saved answers: retries must use the same lead snapshot.
				for (const control of Object.values(controls)) { control.df.read_only = 1; control.refresh(); }
			}
			status.text(__("Inquiry {0} saved. Preparing your solar recommendation…", [lead]));
			const response = await frappe.call({ method: "eola.customer_inquiry.generate_inquiry_recommendation", args: { name: lead } });
			renderResult(response.message);
		} catch (error) {
			status.text(__(lead ? "Your lead is saved. We could not load the recommendation. Click below to retry." : "We could not confirm your submission. Please try again; your answers are retained.")).attr("role", "alert");
		} finally {
			busy = false; previous.prop("disabled", !!lead); next.prop("disabled", false);
			if (lead) next.text(__("Retry recommendation"));
		}
	}
	function renderResult(data) {
		wizard.prop("hidden", true); result.empty().prop("hidden", false);
		const p = data.plan;
		const card = $('<div class="card"></div>').appendTo(result);
		text('<h3 tabindex="-1">', "Your solar starting point", card).trigger("focus");
		text("<p>", `${data.name} · ${data.status} · ${p.system_type}`, card, "text-muted");
		text("<div>", data.explanation, card, "narrative");
		const metrics = $('<div class="metrics"></div>').appendTo(card);
		const money = value => `PHP ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
		for (const [label, value] of [["Solar array", `${p.pv_kwp} kWp · ${p.panel_count} panels`], ["Estimated generation", `${p.monthly_kwh} kWh/month`], ["Estimated bill reduction", `${p.achieved_reduction}%`], ["Estimated monthly savings", money(p.monthly_savings)], ["Estimated remaining bill", money(p.remaining_bill)], ["Planning cost / budget", `${money(p.estimated_cost)} / ${money(p.budget)}`]]) {
			const metric = $('<div class="metric"></div>').appendTo(metrics);
			text("<span>", label, metric); text("<strong>", value, metric);
		}
		text("<p>", `Generation: ${p.daily_kwh} kWh/day · ${p.annual_kwh} kWh/year. Battery storage: ${p.battery_kwh} kWh.`, card);
        const shortfall = Math.max(0, p.estimated_cost - p.budget);
        const budgetNotice = shortfall > 0
            ? `This proposed setup needs an additional ${money(shortfall)} above your budget. Estimated setup cost: ${money(p.estimated_cost)}.`
            : "This proposed setup fits your budget under the planning assumptions.";
        text("<div>", `${budgetNotice} ${p.target_met ? "It meets the modeled target, subject to site assessment and a confirmed quote." : `It does not meet the full modeled target. The full target setup is estimated at ${money(p.target_cost)}.`}`, card, "notice");
		text("<h3>", "Proposed equipment", card);
		const scroll = $('<div style="overflow-x:auto"></div>').appendTo(card);
		const table = $('<table class="equipment"><thead><tr><th>ES Item / description</th><th>Quantity</th><th>Model</th></tr></thead><tbody></tbody></table>').appendTo(scroll);
		for (const equipment of p.equipment) {
			const row = $("<tr>").appendTo(table.find("tbody"));
			text("<td>", `${equipment.selected_item.item} · ${equipment.specification}`, row); text("<td>", String(equipment.quantity), row);
			const cell = text("<td>", equipment.model_status, row);
			for (const candidate of [equipment.selected_item]) text("<div>", [candidate.manufacturer, candidate.model, candidate.item].filter(Boolean).join(" · "), cell);
		}
		if (!p.equipment.length) text("<p>", "No matching ES Items with sufficient stock are available for this estimate. Our team will review the catalog and stock.", card);
		const details = $("<details>").appendTo(card);
		text("<summary>", "Assumptions and installer checks", details);
		const list = $("<ul>").appendTo(details);
		for (const warning of p.warnings) text("<li>", warning, list);
		for (const [key, value] of Object.entries(p.assumptions)) text("<li>", `${key.replaceAll("_", " ")}: ${value}`, list);
		const footer = $('<div class="actions"></div>').appendTo(card);
		btn(footer, "Open Customer Lead", () => frappe.set_route("Form", "Customer Lead", data.name), "primary");
		btn(footer, "New inquiry", () => {
			lead = null; submissionId = newSubmissionId();
			for (const control of Object.values(controls)) {
				control.df.read_only = 0; control.refresh();
				control.set_value(control.df.default ?? (control.df.fieldtype === "Check" ? 0 : ""));
			}
			result.empty().prop("hidden", true); wizard.prop("hidden", false);
			status.empty(); previous.prop("disabled", false); updateGoal(); showStep(0);
		});

	}
	showStep(0);
};
