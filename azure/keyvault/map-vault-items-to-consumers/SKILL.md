---
name: azure-keyvault-map-vault-items-to-consumers
description: "Map Vault Items To Consumers using authorized Azure configuration and telemetry."
---

# Map Vault Items To Consumers

Apply [Azure operating rules](../../shared/OPERATING-RULES.md).

1. Resolve the requested scope; otherwise discover only the authorized scope needed for the question.
2. Inspect vaults, item metadata, access, expiration, networking and consumers through Resource Graph, Key Vault metadata, RBAC, diagnostic logs, private endpoints and workload references.
3. Perform **Map Vault Items To Consumers** and correlate resource IDs, ownership, environment and timestamps.
4. Verify conclusions with independent configuration or telemetry evidence when available.
5. Return the finding first, then affected resources, evidence, confidence, gaps and safe next actions.

Do not mutate resources unless the user explicitly authorizes the exact targets and impact.
