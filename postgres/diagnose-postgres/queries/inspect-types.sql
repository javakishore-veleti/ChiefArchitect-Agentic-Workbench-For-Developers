-- psql variables: schema_name, type_name. Read-only catalog probe.
SELECT n.nspname AS schema_name, t.typname AS type_name, t.typtype,
       pg_catalog.format_type(t.oid, NULL) AS formatted_type,
       NULLIF(t.typbasetype, 0)::regtype AS domain_base_type,
       t.typnotnull AS domain_not_null, t.typdefault AS type_default,
       e.enumlabel, e.enumsortorder,
       con.conname, pg_get_constraintdef(con.oid, true) AS constraint_definition
FROM pg_catalog.pg_type t
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
LEFT JOIN pg_catalog.pg_enum e ON e.enumtypid = t.oid
LEFT JOIN pg_catalog.pg_constraint con ON con.contypid = t.oid
WHERE n.nspname = :'schema_name' AND t.typname = :'type_name'
ORDER BY e.enumsortorder NULLS LAST, con.conname;
