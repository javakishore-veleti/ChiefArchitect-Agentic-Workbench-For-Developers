-- Read-only slot retention snapshot. Columns added by newer releases are
-- intentionally selected; remove unsupported columns for older servers.
SELECT slot_name, plugin, slot_type, database, temporary, active, active_pid,
       xmin, catalog_xmin, restart_lsn, confirmed_flush_lsn,
       wal_status, safe_wal_size, two_phase, inactive_since,
       conflicting, invalidation_reason, failover, synced,
       CASE WHEN restart_lsn IS NULL THEN NULL
            ELSE pg_wal_lsn_diff(
                   CASE WHEN pg_is_in_recovery()
                        THEN pg_last_wal_replay_lsn()
                        ELSE pg_current_wal_lsn()
                   END,
                   restart_lsn)
       END AS retained_wal_bytes
FROM pg_replication_slots
ORDER BY database NULLS FIRST, slot_type, slot_name;
