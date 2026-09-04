---
name: azure-aks-secrets-diagnose-secret-mount-failure
description: "Diagnose Secret Mount Failure using authorized Azure configuration and telemetry."
---

# Diagnose Secret Mount Failure

Apply [Azure operating rules](../../../shared/OPERATING-RULES.md).

1. Resolve the requested scope; otherwise discover only the authorized scope needed for the question.
2. Inspect secret references, CSI mounts, identities, certificates and consuming workloads through secret-reference metadata, workload specifications, CSI state, Key Vault metadata and audit records.
3. Perform **Diagnose Secret Mount Failure** and correlate resource IDs, ownership, environment and timestamps.
4. Verify conclusions with independent configuration or telemetry evidence when available.
5. Return the finding first, then affected resources, evidence, confidence, gaps and safe next actions.

Do not mutate resources unless the user explicitly authorizes the exact targets and impact.
