# Databases, schemas, and `search_path`

Resolve the target as database, effective role, schema, and object. Never assume the first unqualified match is intended. Capture `current_database()`, `session_user`, `current_user`, `current_schemas(true)`, and schema ownership before interpreting visibility or permission failures.

Treat `search_path` as both correctness and security state. Report duplicate object names across visible schemas, nonexistent path entries, and writable schemas preceding trusted schemas. PostgreSQL connections cannot query another database directly; reconnect to the configured database instead.

Use `queries/resolve-object.sql`. Require an explicit schema when it returns multiple candidates.
