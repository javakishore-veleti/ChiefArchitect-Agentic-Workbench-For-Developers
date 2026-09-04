---
name: azure-aks-deployments-audit-resource-configuration
description: "Audit Resource Configuration using authorized Azure configuration and telemetry."
---

# Audit Resource Configuration

Apply [Azure operating rules](../../../shared/OPERATING-RULES.md).

1. Resolve the requested scope; otherwise discover only the authorized scope needed for the question.
2. Inspect deployments, ReplicaSets, pods, images, resources and rollout history through Resource Graph, Kubernetes deployment state, manifests, rollout events, images and approved source repositories.
3. Perform **Audit Resource Configuration** and correlate resource IDs, ownership, environment and timestamps.
4. Verify conclusions with independent configuration or telemetry evidence when available.
5. Return the finding first, then affected resources, evidence, confidence, gaps and safe next actions.

Do not mutate resources unless the user explicitly authorizes the exact targets and impact.
