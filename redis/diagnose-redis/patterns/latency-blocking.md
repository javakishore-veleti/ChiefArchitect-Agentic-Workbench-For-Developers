# Latency and blocking

Load this pattern for latency spikes, event-loop stalls, persistent CPU, slow clients, fork pauses, or throughput regressions.

## Evidence to collect

- Redis/build/OS versions, topology, CPU limits and an exact time window.
- `INFO commandstats`, `INFO clients`, `INFO persistence`, `SLOWLOG GET 32`, `LATENCY LATEST`, `LATENCY DOCTOR`.
- Client counts and output-buffer memory; I/O-thread, replication, AOF/RDB and fork state.
- A controlled baseline using the same payload, concurrency, affinity and network path.

Do not run `MONITOR`, an unconstrained benchmark, or high-cardinality tracing in production. Treat test timeouts and cross-OS benchmark differences as investigation signals, not proof of a server bug.

## Decide

Correlate the spike with slow commands, output-buffer pressure, client tracking, persistence/fork activity, CPU throttling or network change. If CPU remains high after load ends, capture thread-level evidence and replication state before restarting; restarting destroys useful evidence.

Return observed facts, competing causes, disconfirming evidence and the smallest safe next probe.

Official references: [latency monitoring](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency-monitor/) and [benchmarking](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/benchmarks/).
