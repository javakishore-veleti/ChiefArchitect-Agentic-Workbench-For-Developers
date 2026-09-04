-- psql variables: schema_name, table_name. One read-only statement.
SELECT n.nspname AS schema_name, c.relname AS table_name,
       con.conname, con.contype, con.convalidated,
       con.condeferrable, con.condeferred,
       con.conrelid::regclass AS relation,
       NULLIF(con.confrelid, 0)::regclass AS referenced_relation,
       pg_get_constraintdef(con.oid, true) AS definition
FROM pg_catalog.pg_constraint con
JOIN pg_catalog.pg_class c ON c.oid = con.conrelid
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = :'schema_name' AND c.relname = :'table_name'
ORDER BY con.contype, con.conname;
