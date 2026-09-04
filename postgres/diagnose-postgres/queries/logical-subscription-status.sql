-- Read-only logical subscriber worker snapshot. Run in the subscriber database.
SELECT subname, pid, relid::regclass AS relation_name,
       received_lsn, latest_end_lsn, latest_end_time,
       last_msg_send_time, last_msg_receipt_time
FROM pg_stat_subscription
ORDER BY subname, relid NULLS FIRST;
