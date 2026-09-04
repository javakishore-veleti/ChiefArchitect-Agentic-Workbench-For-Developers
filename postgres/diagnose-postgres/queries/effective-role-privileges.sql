-- Read-only identity and privilege inventory.
-- Optional custom settings supplied by the diagnostic runner:
--   diagnose.role_name, diagnose.schema_name, diagnose.object_name
WITH requested AS (
  SELECT
    COALESCE(NULLIF(current_setting('diagnose.role_name', true), ''), current_user)::name AS role_name,
    NULLIF(current_setting('diagnose.schema_name', true), '')::name AS schema_name,
    NULLIF(current_setting('diagnose.object_name', true), '')::name AS object_name
), membership AS (
  SELECT member.rolname AS member_role,
         granted.rolname AS granted_role,
         m.admin_option,
         m.inherit_option,
         m.set_option
  FROM pg_auth_members m
  JOIN pg_roles member ON member.oid = m.member
  JOIN pg_roles granted ON granted.oid = m.roleid
), target AS (
  SELECT r.*, n.oid AS namespace_oid, c.oid AS object_oid, c.relkind,
         n.nspname, c.relname, pg_get_userbyid(c.relowner) AS object_owner
  FROM requested r
  LEFT JOIN pg_namespace n ON n.nspname = r.schema_name
  LEFT JOIN pg_class c ON c.relnamespace = n.oid AND c.relname = r.object_name
)
SELECT jsonb_build_object(
  'session_user', session_user,
  'current_user', current_user,
  'requested_role', t.role_name,
  'role', (SELECT to_jsonb(x) FROM (
    SELECT rolcanlogin, rolsuper, rolinherit, rolbypassrls, rolconnlimit, rolvaliduntil
    FROM pg_roles WHERE rolname = t.role_name
  ) x),
  'database', jsonb_build_object(
    'name', current_database(),
    'connect', has_database_privilege(t.role_name, current_database(), 'CONNECT'),
    'temporary', has_database_privilege(t.role_name, current_database(), 'TEMPORARY')
  ),
  'schema', CASE WHEN t.namespace_oid IS NULL THEN NULL ELSE jsonb_build_object(
    'name', t.nspname,
    'usage', has_schema_privilege(t.role_name, t.namespace_oid, 'USAGE'),
    'create', has_schema_privilege(t.role_name, t.namespace_oid, 'CREATE')
  ) END,
  'object', CASE WHEN t.object_oid IS NULL THEN NULL ELSE jsonb_build_object(
    'name', format('%I.%I', t.nspname, t.relname),
    'kind', t.relkind,
    'owner', t.object_owner,
    'select', has_table_privilege(t.role_name, t.object_oid, 'SELECT'),
    'insert', has_table_privilege(t.role_name, t.object_oid, 'INSERT'),
    'update', has_table_privilege(t.role_name, t.object_oid, 'UPDATE'),
    'delete', has_table_privilege(t.role_name, t.object_oid, 'DELETE')
  ) END,
  'direct_memberships', COALESCE((
    SELECT jsonb_agg(to_jsonb(m) ORDER BY granted_role)
    FROM membership m WHERE member_role = t.role_name
  ), '[]'::jsonb)
) AS effective_privilege_evidence
FROM target t;
