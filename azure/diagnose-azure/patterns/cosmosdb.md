# Cosmos DB

Use for 429/1002 throttling, high RU, hot partitions, query/index regressions, SDK timeouts, change-feed stalls, regional failover, or access failures.

## Evidence plan

1. Resolve the exact account resource ID, database, container, region, API, consistency level, SDK/language/version, operation, time window, activity ID, status/substatus and partition key. Never infer scope from a friendly name alone.
2. Read account/container configuration: regions, failover priorities, throughput/autoscale, partition-key paths, indexing policy, private endpoints, firewall and diagnostic settings. Do not retrieve keys or document bodies.
3. Correlate Azure Monitor metrics and diagnostic logs by UTC window: `TotalRequests`, `NormalizedRUConsumption`, `ProvisionedThroughput`, `ServerSideLatency`, `Availability`, status/substatus, operation and partition-key-range ID. Preserve activity IDs and request charge from sanitized SDK diagnostics.
4. Separate hypotheses:
   - `429`: sustained RU saturation, hot logical/physical partition, control-plane limit, or SDK retry behavior.
   - latency/timeouts: service latency versus client CPU/thread/socket exhaustion, gateway/direct mode, DNS/private-link or region routing.
   - query: compare query text hash, parameters, continuation behavior, index utilization, request charge and partition fan-out.
   - change feed: lease ownership, processor lag, partition splits and host churn.
5. Compare only like-for-like environments and SDK versions. Use `knowledge/cosmosdb-issues.jsonl` as hypothesis evidence, never as proof of the current incident.

## Safe probes

- Prefer Resource Graph, `az cosmosdb show`, database/container metadata, metrics, logs and application diagnostics.
- Explain a query or inspect index metrics only with an approved representative request. Never scan or export business records.
- Never regenerate keys, change throughput/indexing/failover, delete resources, or run bulk data operations. Return a separately approved change plan.

## Output

Report resolved scope, UTC window, observations, ranked causes, contradictions, evidence gaps, impact, and safest next probe. Redact endpoints where required, tokens, keys, connection strings, identities and record values.
