# EOLA

Energy Optimization & Lifecycle application for Frappe. All business records belong to the **EOLA** module. ERPNext is not a dependency: ES Customer, ES Item, ES Issue and ES Maintenance Visit are independent EOLA-owned records, not renamed or modified ERPNext tables. Frappe's User, Role, DocType, Page and Workspace remain framework infrastructure.

## Records and navigation

| Workspace section       | Records                                                  |
| ----------------------- | -------------------------------------------------------- |
| Solar System Management | ES Customer, Installed Solar System, Installed Equipment |
| Equipment Catalog       | ES Item, EOLA Equipment Specification                    |
| Telemetry Monitoring    | Telemetry, Performance Baseline                          |
| Performance & Alerts    | Performance Alert                                        |
| AI-Assisted Maintenance | AI Recommendation                                        |
| Service & Resolution    | ES Issue, ES Maintenance Visit                           |

Telemetry Equipment and Hourly Telemetry Reading are children of Telemetry. Performance Baseline Hour is a child of Performance Baseline. The other eleven records are standalone DocTypes with generated IDs and display names. Equipment Specification holds conditional PV, inverter and battery specifications; Installed Equipment links physical units to their model specification. Battery analysis is future scope.

The **EOLA Dashboard** Desk page (`/app/eola-dashboard`) displays monitored systems, alerts today, systems awaiting review, active maintenance cases, and up to 50 open alerts. Each alert form provides an actual/expected 24-hour chart, evidence, recommendations and its service case.

## Installation

From an existing Frappe bench, after adding this app:

```sh
bench --site <site> install-app eola
```

For a site that already has EOLA installed:

```sh
bench --site <site> migrate
bench build --app eola
```

Installation/migration creates the EOLA Technician role and a database uniqueness constraint on telemetry system/date. Assign **EOLA Technician** to technicians; System Manager also has access. Standard Frappe user permissions apply. Migration and browser verification must be performed on the target site before use; repository unit tests do not exercise schema synchronization or database transactions.

## Daily workflow

1. Create an ES Customer, ES Items and equipment specifications, then a solar system and its installed equipment. Enter the system's PV and inverter capacities; these are declared values, not automatically summed equipment counts.
2. Create one active **system-wide** Time of Day baseline for the date range, with exactly 24 hourly rows. Leave Equipment blank for whole-system telemetry. Equipment-specific baselines can be stored but are not substituted for system baselines. Overlapping applicable baselines block analysis.
3. Create Telemetry for the system/date. Use **Add 24 Hourly Rows**, enter measured mean AC power for each hour, then **Analyze Telemetry**. Each value represents average kW during `[hour, hour + 1)`, so its one-hour energy is numerically the same in kWh. Zero values represent measured zero production, not missing observations.
4. Analysis calculates expected power, signed deviations, daily energy and performance status. Positive-baseline hours at or below -15% are Warning; at or below -30% are Critical. Zero-baseline hours do not trigger underperformance. Disjoint affected hours are recorded individually in evidence, and duration is the sum of affected intervals rather than the enclosing time span.
5. Underperformance creates one Performance Alert and one **ES Issue / New Alert** in the same transaction. Repeated analysis returns the existing alert. Analyzed telemetry and AI outputs are immutable to preserve evidence; historical analysis cannot replace a newer system status.
6. Open the alert and generate or record an AI recommendation. Review with **Accept**, **Modify**, or **Reject**. Modify requires the technician's replacement action; Reject requires a reason. Accept/Modify confirms the existing ES Issue; Reject dismisses it. The case preserves all recommendation details, reviewer identity, review time and source links.
7. Work the case remotely or create an ES Maintenance Visit for a confirmed Site Service case. Resolve the issue with resolution details; Resolved Date is assigned automatically and its alert becomes Resolved. Reopening the case clears the date and reopens the alert. Resolved cases are available as service history in future AI context.

The MVP supports **Grid-Tied** analysis with a complete 24-hour dataset. Off-Grid and Hybrid systems can be registered but analysis is blocked until load, battery and curtailment context is supported. Fifteen-minute and other intervals can be recorded but cannot yet be analyzed. Baseline minimum/maximum values are reference bounds; detection uses the fixed deviation thresholds above. No background ingestion or scheduled analysis is configured.

## AI adapter

EOLA includes an OpenAI Responses API adapter in `eola/openai_provider.py`, registered
through `eola_ai_provider` in `eola/hooks.py`. It uses `gpt-4.1-mini` by default.
Set `openai_api_key` in the target site's `site_config.json` (never in source code),
or provide `OPENAI_API_KEY` in the server environment. Set `openai_model` in site
configuration to override the model. Restart the web processes and clear the site
cache after deploying hook changes. No additional Python dependency is required.

**Generate AI Recommendation** sends the alert evidence and permission-filtered
service history to OpenAI. The adapter requests structured output with `store=False`,
validates it, and converts the five causes/actions into numbered text. Requests use
a 30-second socket timeout and no automatic retries because generation holds an
alert lock. Authentication, quota, network, and invalid-output failures produce an
error without creating a recommendation. Technician review remains required.

**Record AI Recommendation** can still capture an external model's output manually.
To replace OpenAI with another provider, replace the existing hook registration;
exactly one provider must be registered across installed apps.

The callable receives a dictionary containing the alert ID, deterministic evidence JSON and up to 20 permission-filtered resolved service cases. It returns:

```python
{
    "ai_model": "provider/model-version",
    "prompt_version": "solar-v1",
    "finding": "...",
    "possible_causes": "1. First hypothesis and evidence gap\n2. Second hypothesis\n3. Third hypothesis\n4. Fourth hypothesis\n5. Fifth hypothesis",
    "recommended_action": "1. First verification step\n2. Second step\n3. Third step\n4. Fourth step\n5. Fifth step",
    "recommended_type_of_service": "Remote Work",  # or Site Service
    "supporting_evidence": "...",
    "confidence": 75,
}
```

The server stores the exact input context, structured output and generation time. Generated fields cannot set the technician decision or execute maintenance actions. A human must review the recommendation. Calls are synchronous; adapters should use a bounded timeout. Equipment-level diagnostics and weather-aware modeling are future enhancements.

## Verification

From this app directory, use the bench environment:

```sh
../../env/bin/python -m unittest discover -s eola/tests -v
```

Tests cover deterministic calculations, thresholds, incomplete/invalid data, system-type restrictions, DocType relationships, and mocked permission/review/resolution transitions. They do not require a database or external AI service.

License: MIT.

AI Recommendation is displayed as read-only long text on telemetry, performance alerts, service cases, and the recommendation record. New recommendations require exactly five numbered possible reasons and five numbered actions. Provider context requests evidence-based explanations and technician verification. The separate AI Recommendation Record link preserves review and audit navigation. Accept/Modify/Reject updates the displayed decision across linked records; no action is executed automatically.

Each possible reason and recommended action should be one concise sentence. AI Recommendation also includes a read-only Tagged Telemetry Readings table containing the linked telemetry's Warning/Alert rows, with date, time, actual/expected kW and deviation. These rows are copied from analyzed telemetry when the recommendation is created; normal readings are excluded.

### Dashboard review and service tracking

The dashboard separates Performance Alerts from the Issue List. A Confirmed alert is displayed as “Approved · service pending”; approval does not resolve the issue. The Issue List displays New Alert as “Needs Review” and Confirmed as “Awaiting Scheduling”, preserving existing stored statuses. Scheduled and Re-scheduled cases require a scheduled date, and Re-scheduled also requires a reason. Update these fields on ES Issue; maintenance visits retain their own schedule. Resolution details remain mandatory to resolve an issue, which then synchronizes the alert status.

Click Maintenance Cases to show the active cases counted by the metric (Confirmed, Scheduled, Re-scheduled, In Progress, and On Hold). The Issue List status filter also includes review, resolved, closed, and dismissed records. Run the site migration before using this dashboard update to synchronize the new ES Issue fields.

### Customer Inquiry and Customer Leads

Open **Eola → Customer Inquiry** (`/app/customer-inquiry`) for the three-step contact, property, and energy-goals wizard. Submission creates a separate **Customer Lead** with consent timestamps, optional marketing consent, all inquiry answers, and a stored recommendation snapshot. System Managers and EOLA Technicians can create and manage leads. This is an authenticated Desk page.

The results include grid-tied, hybrid or off-grid preliminary sizing, PV and battery quantities, inverter rating, matching active equipment catalog model candidates, daily/monthly/annual generation, expected bill savings, and a budget shortfall when applicable. All money values use PHP, including inquiries outside the Philippines. The customer can replace the default electricity rate. Cost, solar-resource and consumption assumptions are disclosed in the results; they are not live quotations. Equipment compatibility, roof suitability, load profile and local yield require installer verification. This workflow does not dispatch inquiries to installers.

Inquiry submissions and solar estimates stay in EOLA ERP. Recommendations are calculated locally without sending inquiry data to external services.

Validation: `env/bin/python -m unittest eola.tests.test_customer_inquiry -v` from the bench (or use the full interpreter path from the app directory). Run `bench --site <site> migrate` to sync the page, doctype and workspace navigation.

Customer Lead stores recommended equipment in an editable table and exposes System Type. Create Quotation copies the saved equipment and project details into an editable ES Quotation. Existing snapshot rows can be backfilled with `bench --site <site> execute eola.quotation.repair_saved_recommendations`.

Low budgets still receive a minimum modeled setup with a stated funding shortfall. Hybrid proposals may use a smaller battery; off-grid proposals retain the modeled load requirement. Optional usable roof area caps the panel count using a disclosed 3 m² per-panel planning allowance. Roofs too small for the minimum two-panel array require another layout or installation area.

### Item prices and stock for inquiries

Use **ES Item Price** in the Equipment Catalog to maintain one current PHP selling
price per ES Item. Use **ES Stock Entry** to record an opening balance or incoming
stock as a Receipt, and outgoing stock as an Issue. Each entry records one item;
submit it to affect availability. Draft and cancelled entries do not count.
Issues and receipt cancellations that would make stock negative are rejected.
Prices and Stock Entries can also be opened from an ES Item form.

Generate (or regenerate) a Customer Lead recommendation after entering stock.
Matching equipment must have enough submitted stock for the full recommended
quantity. The selected item's ID, manufacturer, model and current price are copied
into Recommended Equipment and onward into quotations. Unavailable equipment
is omitted from the item table and reported in an availability notice. Every
recommended equipment and quotation row must link to an existing ES Item. Items without
stock entries are unavailable. Existing recommendations are snapshots; regenerating
replaces their equipment rows. Recommendations do not reserve stock, and planning
cost estimates remain separate from catalog selling prices.

### Customer acceptance and stock-aware maintenance

Saving an ES Quotation as Accepted creates an ES Customer, linked through the
quotation and source Customer Lead. Repeated acceptance saves reuse that customer.
Inquiry submission itself still creates only a lead and recommendations.

Telemetry can record daily consumption in kWh and reported appliance changes.
Select Daily Consumption Recorded only when that information exists. Grid-tied
analysis also opens a Capacity Shortfall alert when recorded daily consumption
exceeds generated energy, even with normal PV generation. This comparison is not
a measurement of grid imports or self-consumption. Existing generation thresholds
remain separate from this demand assessment.

AI recommendation inputs now include five days of analyzed telemetry up to the
alert date, installed equipment and a current ES Item stock/price snapshot.
Upgrade and replacement actions require technician verification: growing demand
does not prove equipment failure. Catalog presence and stock do not establish
voltage, phase, BMS or system compatibility. Recommendations do not reserve stock.

The explicit `eola.demo_customer_journey.create` command creates a labeled simulated
customer through inquiry, draft quotation, acceptance and installation, with five
complete telemetry days from five days ago through yesterday. Acceptance is dated
seven days ago for the demo; document creation timestamps remain truthful.
`eola.demo_customer_journey.recommend` generates a recommendation on the latest
alert through the configured provider. Neither command runs during migration.

### Telemetry alert types

Analysis selects a primary alert and retains all detected types in Detected Alert
Types. Priority is missing telemetry/communication loss, explicit inverter fault,
unexpected daytime zero generation, overtemperature, abnormal voltage,
underperformance, then daily capacity shortfall. Temperature and positive measured
AC voltage are compared only with configured Installed Solar System limits; zero
limits disable those checks. Explicit Offline readings and absent hours are unknown,
not zero production. Incomplete days show a data-quality notice and partial observed
energy; capacity comparisons are skipped. Duplicate and malformed hours remain invalid.

The approved Sofia Reyes demo amendment keeps days 1–2 normal, day 3 Capacity
Shortfall, day 4 Inverter Fault (explicit faults and zero output at 12:00 and 13:00),
and day 5 Underperformance. Original amended evidence is retained in comments.
