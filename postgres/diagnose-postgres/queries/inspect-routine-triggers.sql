-- psql variables: schema_name, routine_name. One read-only statement.
SELECT ns.nspname AS schema_name, cls.relname AS table_name, trg.tgname,
       trg.tgenabled, pg_get_triggerdef(trg.oid, true) AS definition,
       trg.tgfoid::regprocedure AS function_identity
FROM pg_catalog.pg_trigger trg
JOIN pg_catalog.pg_class cls ON cls.oid = trg.tgrelid
JOIN pg_catalog.pg_namespace ns ON ns.oid = cls.relnamespace
WHERE NOT trg.tgisinternal
  AND trg.tgfoid IN (
    SELECT p.oid
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = :'schema_name' AND p.proname = :'routine_name'
  )
ORDER BY ns.nspname, cls.relname, trg.tgname;
