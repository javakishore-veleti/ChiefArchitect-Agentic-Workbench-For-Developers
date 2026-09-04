# Azure Cache for Redis / Azure Managed Redis

Use for connection timeouts, TLS/auth failures, latency, memory pressure, evictions, low hit rate, replication/failover, access-policy, persistence or migration issues.

## Evidence plan

1. Resolve subscription, resource ID, product generation, SKU, region, private endpoint/DNS, client library/version, application, deployment, database and UTC window. Treat similarly named caches as unrelated until resource IDs match.
2. Read configuration and Azure Monitor metrics: connected clients, operations, server/client load, CPU, memory, fragmentation, evictions, cache misses/hits, network bandwidth, errors and replication health. Do not expose keys, tokens, connection strings or cached values.
3. Correlate sanitized client telemetry: exception type, command category, endpoint, TLS mode, connection-pool/multiplexer state, reconnects, queue/backlog and timeout diagnostics.
4. Classify before recommending:
   - connectivity: DNS/private-link, firewall, TLS/port, credential/access policy, connection churn or client exhaustion;
   - latency: server load, bandwidth, large payload/command, hot key, blocking work or client thread starvation;
   - memory: dataset growth, fragmentation, eviction policy, persistence/failover overhead;
   - correctness: TTL policy, invalidation ordering, namespace collision or environment mapping;
   - management plane: unsupported API/SKU or access-policy tooling behavior.
5. Compare like-for-like cache generation, SKU, topology and client version. Use `knowledge/cache-redis-issues.jsonl` only to rank hypotheses.

## Safe probes

- Prefer Resource Graph, `az redis show`, `az redisenterprise show`, metrics, activity logs, DNS checks and application telemetry.
- Permit metadata-only sampling such as `INFO`, `CLIENT LIST` summaries and bounded keyspace statistics only when policy allows; never return values or full key names.
- Never run `KEYS`, `MONITOR`, `FLUSH*`, import/export, failover, reboot, scale, rotate keys or alter access policy without explicit approval.

## Output

Return resolved scope, observations, ranked causes, contradictions, evidence gaps and safest next probe. Hash key names and redact secrets and sensitive identifiers.
