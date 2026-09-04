-- psql variables: schema_name, routine_name. One read-only statement.
SELECT n.nspname AS schema_name, p.proname AS routine_name,
       p.oid::regprocedure AS identity, p.prokind,
       l.lanname AS language, pg_get_userbyid(p.proowner) AS owner,
       p.provolatile, p.proparallel, p.prosecdef AS security_definer,
       p.proconfig, pg_get_function_result(p.oid) AS result_type,
       pg_get_functiondef(p.oid) AS definition
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
JOIN pg_catalog.pg_language l ON l.oid = p.prolang
WHERE n.nspname = :'schema_name' AND p.proname = :'routine_name'
ORDER BY p.oid::regprocedure::text;
