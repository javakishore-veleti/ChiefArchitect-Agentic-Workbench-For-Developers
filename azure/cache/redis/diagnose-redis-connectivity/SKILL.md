---
name: azure-cache-redis-diagnose-redis-connectivity
description: "Diagnose Redis Connectivity across authorized AKIV Diagnostics Azure environments. Use when developers or operators need evidence about Redis instances, tiers, regions, networking, consumers, keyspace metadata, TTL policy, capacity, latency, and availability."
---

# Diagnose Redis Connectivity

Perform this task across the authorized enterprise scope without embedding subscription IDs, portfolio names, program names, environments, or service inventories in the skill.

## Scope

Accept any available filters: management group, subscription, portfolio, program, environment, region, cluster or resource name, namespace, service, workload, correlation ID, and time range. If scope is ambiguous and the operation could be expensive or mutate resources, ask for a narrower scope. Read-only discovery may start broadly and narrow from evidence.

## Procedure

1. Establish the authenticated tenant and authorized scope. Record unavailable subscriptions or data sources; never silently treat them as empty.
2. Discover Redis instances, tiers, regions, networking, consumers, keyspace metadata, TTL policy, capacity, latency, and availability using Azure Resource Graph, Azure CLI, Azure Monitor metrics, diagnostic logs, application configuration, dependency telemetry, and approved cache metadata.
3. Normalize each result with subscription, resource group, region, portfolio, program, environment, service owner, resource ID, and observation time when available.
4. Execute **Diagnose Redis Connectivity**. Follow resource relationships and timestamps; distinguish observed facts from inference.
5. Correlate configuration with deployments, identities, telemetry, and source-controlled definitions when those sources are relevant and authorized.
6. Validate the conclusion with at least two independent signals when possible. State gaps and confidence when evidence is incomplete.
7. Return the requested answer first, followed by affected resources, evidence, likely cause or risk, and safe next actions.

## Safety

Default to read-only operations. Never expose credentials, tokens, secret values, patient information, or raw sensitive payloads. Redact identifiers not needed for engineering diagnosis. Do not change production resources, access, networking, scaling, data, or retention without explicit authorization and a preview of the exact target and impact.

## Output contract

Return:

- scope searched and sources consulted;
- concise finding;
- affected resources and ownership context;
- evidence with timestamps and resource identifiers;
- facts, inferences, and confidence;
- missing access or telemetry;
- recommended next actions, marking any mutation as proposed rather than completed.
