# Vacuum, bloat, freezing, and maintenance

Load for dead tuples, table or index growth, stale statistics, autovacuum lag, wraparound risk, vacuum contention, ANALYZE anomalies, or REINDEX/DDL planning.

## Read-only evidence

Run `queries/table-health.sql` with a bounded schema filter. Capture database and relation transaction ages, live/dead tuple estimates, modification counts, last vacuum/analyze times, worker progress, relation sizes and per-table autovacuum settings. Estimates are signals, not proof of bloat. Compare trends and workload history before recommending a rewrite.

Use an approved least-privilege monitoring role. Catalog object names may disclose tenant or clinical-domain structure; return only the necessary qualified names. Do not collect row values. `pg_stat_activity.query`, logs and sampled SQL can contain personal data or literal identifiers, so prefer query IDs/digests and redact parameters.

## Decide

- Separate heap dead tuples, index sparsity, TOAST growth and filesystem/RSS growth.
- Separate ordinary vacuum, aggressive vacuum, failsafe behavior and actual wraparound risk. Report `age(datfrozenxid)` and relation age with configured thresholds.
- A long-lived snapshot, replication slot or prepared transaction can prevent cleanup even when autovacuum runs.
- Treat `n_dead_tup` and last-run timestamps as estimates; corroborate with progress, logs and size trends.
- ANALYZE addresses planner statistics, not physical bloat. REINDEX addresses an index, not heap bloat.
- `REINDEX CONCURRENTLY` and concurrent index creation reduce blocking but still require locks and extra disk/WAL capacity.

## Authorization boundary

Do not run `VACUUM`, `VACUUM FULL`, `ANALYZE`, `REINDEX`, `CLUSTER`, `ALTER TABLE`, change autovacuum settings, or install inspection extensions without explicit authorization naming the database and relations. Present expected locks, disk/WAL headroom, replica impact, rollback/abort conditions and a maintenance window first. Never present a development proposal from the evidence catalog as released behavior.

Official references: [routine vacuuming](https://www.postgresql.org/docs/current/routine-vacuuming.html), [vacuum progress](https://www.postgresql.org/docs/current/progress-reporting.html#VACUUM-PROGRESS-REPORTING), and [routine reindexing](https://www.postgresql.org/docs/current/routine-reindex.html).
