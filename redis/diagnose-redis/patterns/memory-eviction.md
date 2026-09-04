# Memory and eviction

Load this pattern for OOM, rising RSS, eviction surprises, allocator fragmentation, or memory that does not fall after deletes.

## Evidence to collect

- Redis version, topology, uptime, workload change and time window.
- `INFO memory`, `INFO stats`, `MEMORY STATS`, `CONFIG GET maxmemory maxmemory-policy maxmemory-samples`.
- `MEMORY USAGE <known-key> SAMPLES 5` for explicitly supplied keys; never enumerate production keys broadly.
- Client and cluster-buffer memory, replication backlog, fork/AOF/RDB activity, container limit and host OOM evidence.

## Decide

Separate dataset growth, eviction-policy behavior, non-key buffers, allocator fragmentation, fork copy-on-write, and a suspected regression. `used_memory`, RSS and configured `maxmemory` answer different questions. Do not treat an open report as a confirmed Redis defect.

For cluster Pub/Sub growth, compare per-node cluster-link memory with publish rate and client count. For LRU/LFU questions, verify the configured policy and sampled approximation before calling an eviction unexpected.

## Safe output

Report measurements, affected node(s), first divergence time, policy, likely mechanism and confidence. Recommend a version change only when release or maintainer evidence supports it.

Official references: [memory optimization](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/) and [eviction](https://redis.io/docs/latest/develop/reference/eviction/).
