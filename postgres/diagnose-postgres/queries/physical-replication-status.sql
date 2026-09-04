-- Read-only physical sender snapshot. An empty result is meaningful.
SELECT application_name, client_addr, usename, state, sync_state,
       sent_lsn, write_lsn, flush_lsn, replay_lsn,
       pg_size_pretty(pg_wal_lsn_diff(sent_lsn, replay_lsn)) AS replay_byte_lag,
       write_lag, flush_lag, replay_lag, backend_start
FROM pg_stat_replication
ORDER BY application_name, client_addr;
