---
name: diagnose-image-pull-failure
description: "Diagnose Image Pull Failure using authorized Azure configuration and telemetry."
---

# Diagnose Image Pull Failure

Apply [Azure operating rules](../../shared/OPERATING-RULES.md).

1. Resolve the requested scope; otherwise discover only the authorized scope needed for the question.
2. Inspect registries, repositories, digests, tags, vulnerabilities, retention and deployments through Resource Graph, ACR manifests, scan results, AKS specifications and pipeline provenance.
3. Perform **Diagnose Image Pull Failure** and correlate resource IDs, ownership, environment and timestamps.
4. Verify conclusions with independent configuration or telemetry evidence when available.
5. Return the finding first, then affected resources, evidence, confidence, gaps and safe next actions.

Do not mutate resources unless the user explicitly authorizes the exact targets and impact.
