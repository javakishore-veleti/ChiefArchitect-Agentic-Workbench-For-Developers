---
name: validate-ingress-configuration
description: "Validate Ingress Configuration using authorized Azure configuration and telemetry."
---

# Validate Ingress Configuration

Apply [Azure operating rules](../../../shared/OPERATING-RULES.md).

1. Resolve the requested scope; otherwise discover only the authorized scope needed for the question.
2. Inspect hosts, paths, routes, backend Services, endpoints, certificates and controllers through ingress resources, controllers, gateway routes, DNS, TLS metadata and controller telemetry.
3. Perform **Validate Ingress Configuration** and correlate resource IDs, ownership, environment and timestamps.
4. Verify conclusions with independent configuration or telemetry evidence when available.
5. Return the finding first, then affected resources, evidence, confidence, gaps and safe next actions.

Do not mutate resources unless the user explicitly authorizes the exact targets and impact.
