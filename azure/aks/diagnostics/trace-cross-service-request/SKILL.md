---
name: azure-aks-diagnostics-trace-cross-service-request
description: "Trace Cross Service Request using authorized Azure configuration and telemetry."
---

# Trace Cross Service Request

Apply [Azure operating rules](../../../shared/OPERATING-RULES.md).

1. Resolve the requested scope; otherwise discover only the authorized scope needed for the question.
2. Inspect cluster, node, namespace, workload, event, log, trace and dependency evidence through Kubernetes events and logs, Container Insights, Azure Monitor, Application Insights and deployment metadata.
3. Perform **Trace Cross Service Request** and correlate resource IDs, ownership, environment and timestamps.
4. Verify conclusions with independent configuration or telemetry evidence when available.
5. Return the finding first, then affected resources, evidence, confidence, gaps and safe next actions.

Do not mutate resources unless the user explicitly authorizes the exact targets and impact.
