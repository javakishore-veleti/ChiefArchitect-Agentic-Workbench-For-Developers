-- psql variables: schema_name, object_name. Read-only catalog probe.
SELECT current_database() AS database_name,
       session_user, current_user, current_schemas(true) AS effective_search_path,
       n.nspname AS schema_name, c.relname AS object_name,
       c.oid::regclass AS qualified_name, c.relkind,
       pg_get_userbyid(c.relowner) AS owner,
       pg_relation_is_visible(c.oid) AS visible,
       has_schema_privilege(current_user, n.oid, 'USAGE') AS schema_usage
FROM pg_catalog.pg_class c
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = :'object_name'
  AND (NULLIF(:'schema_name', '') IS NULL OR n.nspname = :'schema_name')
ORDER BY n.nspname, c.relname;
