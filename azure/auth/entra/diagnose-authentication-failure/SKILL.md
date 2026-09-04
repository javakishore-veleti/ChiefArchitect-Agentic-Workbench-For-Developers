---
name: azure-auth-entra-diagnose-authentication-failure
description: "Diagnose Authentication Failure using authorized Azure configuration and telemetry."
---

# Diagnose Authentication Failure

Apply [Azure operating rules](../../../shared/OPERATING-RULES.md).

1. Resolve the requested scope; otherwise discover only the authorized scope needed for the question.
2. Inspect applications, identities, permissions, credentials, roles, sign-ins and workload mappings through Microsoft Graph, Resource Graph, app registrations, service principals, RBAC and sign-in logs.
3. Perform **Diagnose Authentication Failure** and correlate resource IDs, ownership, environment and timestamps.
4. Verify conclusions with independent configuration or telemetry evidence when available.
5. Return the finding first, then affected resources, evidence, confidence, gaps and safe next actions.

Do not mutate resources unless the user explicitly authorizes the exact targets and impact.
