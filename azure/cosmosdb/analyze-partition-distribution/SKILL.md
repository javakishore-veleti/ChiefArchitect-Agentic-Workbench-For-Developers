---
name: analyze-partition-distribution
description: "Analyze Partition Distribution using authorized Azure configuration and telemetry."
---

# Analyze Partition Distribution

Apply [Azure operating rules](../../shared/OPERATING-RULES.md).

1. Resolve the requested scope; otherwise discover only the authorized scope needed for the question.
2. Inspect accounts, databases, containers, partitions, throughput, indexes, access and dependencies through Resource Graph, Cosmos DB metadata, metrics, diagnostics, indexing policies and application configuration.
3. Perform **Analyze Partition Distribution** and correlate resource IDs, ownership, environment and timestamps.
4. Verify conclusions with independent configuration or telemetry evidence when available.
5. Return the finding first, then affected resources, evidence, confidence, gaps and safe next actions.

Do not mutate resources unless the user explicitly authorizes the exact targets and impact.
