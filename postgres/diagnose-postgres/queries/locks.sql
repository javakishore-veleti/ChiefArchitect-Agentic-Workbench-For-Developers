-- Read-only. Shows waiting sessions without SQL text, client address, or application name.
-- pg_stat_activity visibility is privilege-dependent; an empty result is not proof of no waits.
SELECT a.pid,
       a.backend_start,
       a.xact_start,
       clock_timestamp() - a.xact_start AS transaction_age,
       a.state,
       a.wait_event_type,
       a.wait_event,
       l.locktype,
       l.mode,
       l.relation::regclass AS relation,
       l.transactionid,
       pg_blocking_pids(a.pid) AS blocking_pids,
       CASE WHEN a.query_id IS NULL THEN NULL ELSE a.query_id::text END AS query_id
FROM pg_stat_activity AS a
JOIN pg_locks AS l ON l.pid = a.pid AND NOT l.granted
WHERE a.datid = (SELECT oid FROM pg_database WHERE datname = current_database())
ORDER BY transaction_age DESC NULLS LAST, a.pid, l.locktype, l.mode;
