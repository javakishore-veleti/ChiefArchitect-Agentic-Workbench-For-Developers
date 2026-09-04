# Locks, deadlocks, and transactions

Load for blocked work, deadlock errors, serialization failures, idle-in-transaction sessions, snapshot retention, or concurrent DDL.

## Establish context

Resolve environment, cluster, database and effective role before diagnosis. Record PostgreSQL version, incident interval, transaction isolation, retry policy and whether pooling is transaction- or session-based. Object names are schema-qualified; a PID is meaningful only for the current server instance.

## Read-only evidence

Run `queries/locks.sql` for waiting sessions and `queries/blocking-tree.sql` for blocker chains. Inspect transaction and state age, wait event, lock type/mode and `pg_blocking_pids()`. Correlate deadlock log detail when approved. Do not retrieve or reproduce SQL text by default: `pg_stat_activity.query`, application names, client addresses and log parameters can expose personal, clinical or tenant data. Prefer query IDs or a one-way digest and redact literals.

Visibility in `pg_stat_activity` and lock views depends on privileges; distinguish “not visible” from “not present.” Use a least-privilege monitoring role rather than application credentials. Never assume the oldest transaction is the blocker; distinguish lock wait, old snapshot, idle transaction and slow execution.

## Decide

- For a lock wait, show the complete blocker chain and lock compatibility, including prepared transactions when applicable.
- For a deadlock, reconstruct resource acquisition order; a deadlock victim is not necessarily the root design problem.
- For serialization failure, treat retry as part of the isolation contract, not as a deadlock fix.
- For long transactions, assess retained snapshots, vacuum impact and connection-pool behavior separately from blocking.
- For DDL, verify required lock modes and `lock_timeout`; “concurrent” operations still take short-lived locks.

## Authorization boundary

The skill may propose a bounded remediation. It must not call `pg_cancel_backend`, `pg_terminate_backend`, commit/rollback another workflow, change timeouts, or run DDL without explicit authorization identifying the database and target. Re-check PID, backend start time and transaction state immediately before any separately authorized session action.

Official references: [lock monitoring](https://www.postgresql.org/docs/current/view-pg-locks.html), [explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html), and [transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html).
