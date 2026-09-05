---
name: map-services-to-workloads
description: "Map Services To Workloads using authorized Azure configuration and telemetry."
---

# Map Services To Workloads

Apply [Azure operating rules](../../../shared/OPERATING-RULES.md).

1. Resolve the requested scope; otherwise discover only the authorized scope needed for the question.
2. Inspect Services, selectors, endpoints, ports, exposure and owning workloads through Kubernetes Services, EndpointSlices, workload selectors, network state and service catalogs.
3. Perform **Map Services To Workloads** and correlate resource IDs, ownership, environment and timestamps.
4. Verify conclusions with independent configuration or telemetry evidence when available.
5. Return the finding first, then affected resources, evidence, confidence, gaps and safe next actions.

Do not mutate resources unless the user explicitly authorizes the exact targets and impact.
