-- Read-only. Bind :schema_name and :table_name in the SQL client.
SELECT
  current_database() AS database_name,
  schemaname AS schema_name,
  tablename AS table_name,
  attname AS column_name,
  inherited,
  null_frac,
  avg_width,
  n_distinct,
  most_common_vals,
  most_common_freqs,
  histogram_bounds,
  correlation
FROM pg_catalog.pg_stats
WHERE schemaname = :'schema_name'
  AND tablename = :'table_name'
ORDER BY attname;
