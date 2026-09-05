---
name: validate-hpa-metrics
description: "Validate Hpa Metrics using authorized Azure configuration and telemetry."
---

# Validate Hpa Metrics

Apply [Azure operating rules](../../../shared/OPERATING-RULES.md).

1. Resolve the requested scope; otherwise discover only the authorized scope needed for the question.
2. Inspect scaling policies, signals, thresholds, workload demand, node capacity and scaling events through HPA and VPA state, cluster autoscaler events, Kubernetes metrics and Azure Monitor.
3. Perform **Validate Hpa Metrics** and correlate resource IDs, ownership, environment and timestamps.
4. Verify conclusions with independent configuration or telemetry evidence when available.
5. Return the finding first, then affected resources, evidence, confidence, gaps and safe next actions.

Do not mutate resources unless the user explicitly authorizes the exact targets and impact.
