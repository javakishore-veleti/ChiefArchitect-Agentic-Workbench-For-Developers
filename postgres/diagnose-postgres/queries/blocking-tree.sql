-- Read-only blocker edges. Repeat/root in the caller if a visual tree is required.
-- SQL text and client metadata are intentionally excluded to reduce PII/tenant-data exposure.
WITH waiting AS (
  SELECT a.pid AS waiting_pid,
         a.backend_start AS waiting_backend_start,
         a.xact_start AS waiting_xact_start,
         blocker.pid AS blocking_pid
  FROM pg_stat_activity AS a
  CROSS JOIN LATERAL unnest(pg_blocking_pids(a.pid)) AS blocker(pid)
  WHERE a.datid = (SELECT oid FROM pg_database WHERE datname = current_database())
)
SELECT w.waiting_pid,
       w.waiting_backend_start,
       clock_timestamp() - w.waiting_xact_start AS waiting_transaction_age,
       w.blocking_pid,
       b.backend_start AS blocking_backend_start,
       b.state AS blocking_state,
       clock_timestamp() - b.xact_start AS blocking_transaction_age,
       b.wait_event_type AS blocking_wait_event_type,
       b.wait_event AS blocking_wait_event,
       CASE WHEN b.query_id IS NULL THEN NULL ELSE b.query_id::text END AS blocking_query_id
FROM waiting AS w
LEFT JOIN pg_stat_activity AS b ON b.pid = w.blocking_pid
ORDER BY waiting_transaction_age DESC NULLS LAST, w.waiting_pid, w.blocking_pid;
