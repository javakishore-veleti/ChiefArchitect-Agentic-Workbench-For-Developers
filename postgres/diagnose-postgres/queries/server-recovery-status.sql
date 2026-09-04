-- Read-only node identity, version, recovery role, and relevant WAL position.
SELECT now() AS observed_at,
       current_database() AS database_name,
       current_user AS session_user,
       current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS is_in_recovery,
       CASE WHEN pg_is_in_recovery()
            THEN pg_last_wal_replay_lsn()
            ELSE pg_current_wal_lsn()
       END AS relevant_wal_lsn;
