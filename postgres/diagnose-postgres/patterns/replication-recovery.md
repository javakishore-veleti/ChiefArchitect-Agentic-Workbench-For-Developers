# Replication and recovery

Load this pattern for physical or logical replication, slots, retained WAL, lag, failover, archiving, backup, PITR, dump/restore, or upgrade questions.

## Establish context

Record the environment, cluster, database, node identity, `pg_is_in_recovery()`, server version, effective role, topology, replication mode, slot/subscription name, and observation time. Compare nodes only when all of those dimensions are explicit. A same-named slot in another database or cluster is not the same object.

## Read-only workflow

1. Run `queries/server-recovery-status.sql` separately on each relevant node.
2. Select only the applicable narrow probe: `physical-replication-status.sql`, `logical-subscription-status.sql`, `replication-slots.sql`, or `wal-archiver-status.sql`.
3. Validate every probe with `scripts/validate-sql-plan.mjs` before execution.
4. Correlate byte lag with timestamps, worker state, wait events, archive status, disk capacity, and WAL generation rate.
5. Load only relevant records from `knowledge/replication-recovery.jsonl`; retain source and evidence status in the result.
6. State observed facts, likely causes, missing evidence, and the next safe verification. Do not turn a community report into a confirmed defect.

## Interpretation guardrails

- `sent_lsn`, `write_lsn`, `flush_lsn`, and `replay_lsn` describe different stages. Time columns can be null and are not interchangeable with byte lag.
- A logical slot's `confirmed_flush_lsn` is consumer acknowledgement; `restart_lsn` is the older retention horizon. Diagnose both.
- An inactive slot may retain WAL. `wal_status`, `safe_wal_size`, `inactive_since`, `conflicting`, and `invalidation_reason` are version-dependent; null is meaningful.
- Physical replay lag and logical subscription apply lag require different catalog views. Query the publisher and subscriber intentionally.
- Promotion creates a new timeline. PITR confidence requires a continuous archive, the history files, a compatible base backup, and a rehearsed restore.
- A successful backup command is not proof of recoverability. Verify the chain and restore it in isolation.
- `pg_dump` includes TOAST values belonging to selected tables. Logical dumps are not physical replicas and do not preserve every cluster-level object.
- Major upgrades require version- and extension-specific checks. Do not infer that old physical standbys can consume a new major version's WAL.

## Prohibited actions

Never drop or advance slots, promote a standby, alter a subscription, pause replay, run `pg_rewind`, modify archive/recovery settings, take a destructive base backup, or initiate restore/failover. Produce an evidence report and a separately reviewed operational plan.

## Minimum result

Return context, role/recovery state, physical send/write/flush/replay positions, logical subscription/slot state, retained-WAL estimate, archive health, version limitations, evidence URLs, confidence, and unanswered questions. Redact connection strings and credentials.
