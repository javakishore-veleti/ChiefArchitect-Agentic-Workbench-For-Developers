-- Read-only. Bind :schema_name and :table_name in the SQL client.
SELECT
  current_database() AS database_name,
  n.nspname AS schema_name,
  t.relname AS table_name,
  i.relname AS index_name,
  am.amname AS access_method,
  x.indisprimary,
  x.indisunique,
  x.indisvalid,
  x.indisready,
  x.indislive,
  x.indisclustered,
  pg_get_indexdef(i.oid) AS index_definition,
  pg_get_expr(x.indexprs, x.indrelid) AS expressions,
  pg_get_expr(x.indpred, x.indrelid) AS predicate,
  con.conname AS supporting_constraint,
  inh.inhparent::regclass AS partitioned_parent_index,
  pg_relation_size(i.oid) AS index_bytes,
  s.idx_scan,
  s.idx_tup_read,
  s.idx_tup_fetch
FROM pg_catalog.pg_class AS t
JOIN pg_catalog.pg_namespace AS n ON n.oid = t.relnamespace
JOIN pg_catalog.pg_index AS x ON x.indrelid = t.oid
JOIN pg_catalog.pg_class AS i ON i.oid = x.indexrelid
JOIN pg_catalog.pg_am AS am ON am.oid = i.relam
LEFT JOIN pg_catalog.pg_constraint AS con ON con.conindid = i.oid
LEFT JOIN pg_catalog.pg_inherits AS inh ON inh.inhrelid = i.oid
LEFT JOIN pg_catalog.pg_stat_user_indexes AS s ON s.indexrelid = i.oid
WHERE n.nspname = :'schema_name'
  AND t.relname = :'table_name'
ORDER BY i.relname;

