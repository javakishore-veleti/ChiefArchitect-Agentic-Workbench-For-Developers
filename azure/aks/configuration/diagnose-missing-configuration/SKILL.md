---
name: azure-aks-configuration-diagnose-missing-configuration
description: "Diagnose Missing Configuration using authorized Azure configuration and telemetry."
---

# Diagnose Missing Configuration

Apply [Azure operating rules](../../../shared/OPERATING-RULES.md).

1. Resolve the requested scope; otherwise discover only the authorized scope needed for the question.
2. Inspect configuration references, consuming workloads, ownership and environment differences through ConfigMaps, workload specifications, manifests, App Configuration metadata and approved repositories.
3. Perform **Diagnose Missing Configuration** and correlate resource IDs, ownership, environment and timestamps.
4. Verify conclusions with independent configuration or telemetry evidence when available.
5. Return the finding first, then affected resources, evidence, confidence, gaps and safe next actions.

Do not mutate resources unless the user explicitly authorizes the exact targets and impact.
