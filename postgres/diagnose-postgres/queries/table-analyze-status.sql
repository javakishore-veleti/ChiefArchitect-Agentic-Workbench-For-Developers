-- Read-only. Bind :schema_name and :table_name in the SQL client.
SELECT
  s.schemaname AS schema_name,
  s.relname AS table_name,
  s.n_live_tup,
  s.n_dead_tup,
  s.last_analyze,
  s.last_autoanalyze,
  s.analyze_count,
  s.autoanalyze_count,
  c.reltuples AS planner_rows,
  c.relpages AS planner_pages
FROM pg_catalog.pg_stat_user_tables AS s
JOIN pg_catalog.pg_class AS c ON c.oid = s.relid
WHERE s.schemaname = :'schema_name'
  AND s.relname = :'table_name';
