-- Read-only RLS inventory. Set diagnose.schema_name and
-- diagnose.object_name to narrow the result; unset values include all tables.
WITH scope AS (
  SELECT NULLIF(current_setting('diagnose.schema_name', true), '') AS schema_name,
         NULLIF(current_setting('diagnose.object_name', true), '') AS object_name
)
SELECT n.nspname AS schema_name,
       c.relname AS table_name,
       session_user AS session_user,
       current_user AS current_user,
       current_role.rolsuper AS current_role_superuser,
       current_role.rolinherit AS current_role_inherits,
       current_role.rolbypassrls AS current_role_bypasses_rls,
       current_setting('row_security') AS row_security_setting,
       pg_get_userbyid(c.relowner) AS table_owner,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced,
       p.polname AS policy_name,
       CASE p.polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT'
         WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' WHEN '*' THEN 'ALL' END AS command,
       p.polpermissive AS permissive,
       ARRAY(SELECT r.rolname FROM pg_roles r WHERE r.oid = ANY (p.polroles) ORDER BY r.rolname) AS roles,
       pg_get_expr(p.polqual, p.polrelid) AS using_expression,
       pg_get_expr(p.polwithcheck, p.polrelid) AS with_check_expression
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
CROSS JOIN scope s
JOIN pg_roles current_role ON current_role.rolname = current_user
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE c.relkind IN ('r', 'p')
  AND (s.schema_name IS NULL OR n.nspname = s.schema_name)
  AND (s.object_name IS NULL OR c.relname = s.object_name)
ORDER BY n.nspname, c.relname, p.polname NULLS FIRST;
