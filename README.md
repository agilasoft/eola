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

There is no default model, API credential, external request or fabricated AI output. **Record AI Recommendation** captures an external model's output and metadata. **Generate AI Recommendation** requires exactly one callable registered by an installed integration app:

```python
# Integration app hooks.py
# The adapter owns provider credentials, timeout/retry handling and model selection.
eola_ai_provider = "my_integration.solar.generate_recommendation"
```

The callable receives a dictionary containing the alert ID, deterministic evidence JSON and up to 20 permission-filtered resolved service cases. It returns:

```python
{
    "ai_model": "provider/model-version",
    "prompt_version": "solar-v1",
    "finding": "...",
    "possible_causes": "...",
    "recommended_action": "...",
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
