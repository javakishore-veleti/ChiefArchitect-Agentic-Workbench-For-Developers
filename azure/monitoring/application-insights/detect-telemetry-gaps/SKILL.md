---
name: azure-monitoring-application-insights-detect-telemetry-gaps
description: "Detect Telemetry Gaps using authorized Azure configuration and telemetry."
---

# Detect Telemetry Gaps

Apply [Azure operating rules](../../../shared/OPERATING-RULES.md).

1. Resolve the requested scope; otherwise discover only the authorized scope needed for the question.
2. Inspect components, operations, traces, dependencies, exceptions, availability, alerts and ownership through Application Insights, Log Analytics, Azure Monitor, traces, dependencies and deployment metadata.
3. Perform **Detect Telemetry Gaps** and correlate resource IDs, ownership, environment and timestamps.
4. Verify conclusions with independent configuration or telemetry evidence when available.
5. Return the finding first, then affected resources, evidence, confidence, gaps and safe next actions.

Do not mutate resources unless the user explicitly authorizes the exact targets and impact.
