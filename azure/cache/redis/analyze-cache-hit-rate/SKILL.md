---
name: analyze-cache-hit-rate
description: "Analyze Cache Hit Rate using authorized Azure configuration and telemetry."
---

# Analyze Cache Hit Rate

Apply [Azure operating rules](../../../shared/OPERATING-RULES.md).

1. Resolve the requested scope; otherwise discover only the authorized scope needed for the question.
2. Inspect instances, topology, consumers, TTL policy, memory, latency, availability and cache effectiveness through Resource Graph, Redis metadata, Azure Monitor, diagnostics and application dependency configuration.
3. Perform **Analyze Cache Hit Rate** and correlate resource IDs, ownership, environment and timestamps.
4. Verify conclusions with independent configuration or telemetry evidence when available.
5. Return the finding first, then affected resources, evidence, confidence, gaps and safe next actions.

Do not mutate resources unless the user explicitly authorizes the exact targets and impact.
