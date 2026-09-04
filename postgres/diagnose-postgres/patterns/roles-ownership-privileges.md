# Roles, ownership and privileges

Use this pattern for `permission denied`, unexpected inherited access, ownership, `SET ROLE`, default privileges, row-level security or unsafe `search_path` behavior.

## Resolve identity before objects

- Record `session_user`, `current_user`, requested login role and effective role. Reconnecting is not equivalent to `SET ROLE`; `RESET ROLE` only applies within the current session.
- Expand membership through `pg_auth_members`, retaining `inherit_option`, `set_option` and `admin_option` where supported. Do not equate membership with permission to `SET ROLE`.
- Distinguish ownership from ACL privileges. Ownership controls many DDL operations and is not represented by a simple grant.
- Check every layer: database `CONNECT`; schema `USAGE`/`CREATE`; object privileges; sequence privileges behind identity/serial defaults; and function `EXECUTE` using the complete identity-argument signature.
- Inspect default privileges for the role that creates future objects. They do not retroactively change existing objects and are not global to all creators.
- For RLS, record table owner, `relrowsecurity`, `relforcerowsecurity`, role `BYPASSRLS`, command, policy roles, permissive/restrictive mode, `USING` and `WITH CHECK`. Do not infer behavior from a SELECT-only test.
- Treat writable schemas on `search_path` as a trust boundary. Schema-qualify security-sensitive objects and inspect function-level `proconfig`.

Run `queries/effective-role-privileges.sql` for identity and current ACL evidence, `queries/default-privileges.sql` for future-object defaults, and `queries/rls-policies.sql` for policy evidence. Each is one read-only statement. Load `knowledge/security.jsonl` only for matched topics.

## Return

State the grant path or denial at each layer. Keep “owns object,” “has privilege,” “inherits privilege,” “may SET ROLE,” and “bypasses RLS” as separate findings.
