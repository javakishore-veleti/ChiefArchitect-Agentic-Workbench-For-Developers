-- Read-only estimates. Set a bounded schema in this session, for example:
--   SET diagnostics.schema = 'application';
-- An unset setting returns no rows rather than scanning every user schema.
SELECT s.schemaname,
       s.relname,
       s.n_live_tup,
       s.n_dead_tup,
       s.n_mod_since_analyze,
       s.last_vacuum,
       s.last_autovacuum,
       s.last_analyze,
       s.last_autoanalyze,
       c.reltuples::bigint AS estimated_rows,
       age(c.relfrozenxid) AS xid_age,
       pg_total_relation_size(c.oid) AS total_bytes,
       pg_relation_size(c.oid) AS heap_bytes,
       pg_indexes_size(c.oid) AS index_bytes,
       c.reloptions
FROM pg_stat_user_tables AS s
JOIN pg_namespace AS n ON n.nspname = s.schemaname
JOIN pg_class AS c ON c.relnamespace = n.oid AND c.relname = s.relname
WHERE s.schemaname = current_setting('diagnostics.schema', true)
ORDER BY s.n_dead_tup DESC, pg_total_relation_size(c.oid) DESC;
