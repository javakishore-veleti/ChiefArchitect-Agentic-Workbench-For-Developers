-- Read-only default ACL inventory. These ACLs apply only to objects created
-- later by the named role, optionally within the listed schema.
SELECT pg_get_userbyid(d.defaclrole) AS creating_role,
       n.nspname AS schema_name,
       d.defaclobjtype AS object_type,
       d.defaclacl AS default_acl
FROM pg_default_acl d
LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace
ORDER BY creating_role, schema_name NULLS FIRST, object_type;
