# Cluster, replication and persistence

Load this pattern for failover topology errors, full synchronization, replica lag, RDB/AOF failure, stalled rewrite, or recovery-state differences.

## Evidence to collect

- Version on every node, role/slot ownership and the event timeline.
- `INFO replication`, `INFO persistence`, `ROLE`, `CLUSTER INFO`, `CLUSTER NODES` and relevant server logs.
- Replication IDs/offsets, backlog size, sync type, fork status, last save/rewrite status, file sizes and disk capacity/latency.
- Before recovery, preserve logs and checksums of persistence artifacts without copying production data into the repository.

## Decide

Distinguish expected full sync after backlog/ID loss from repeated avoidable full sync. After failover, verify every replica points directly to the intended primary. A healthy parent process does not prove an AOF rewrite child is progressing. Compare logical Stream consumer-group state before and after persistence recovery when pending entries matter.

Never issue `CLUSTER FAILOVER`, `REPLICAOF`, `BGREWRITEAOF`, repair, deletion or restart commands without explicit authorization. Keep reports from managed services distinct from Redis core behavior.

Official references: [replication](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/), [cluster scaling](https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/) and [persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/).
