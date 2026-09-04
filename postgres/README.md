# PostgreSQL skills

`diagnose-postgres` is the single discoverable skill. It resolves an exact environment, cluster, database, effective role/search path, schema, and object before selecting one diagnostic pattern.

## Foundation

- `shared/config`: multi-cluster, multi-database and multi-role configuration; whole-entry overrides through `POSTGRES_CONFIG_OVERRIDE_URI` from local/file, HTTPS, S3, or Azure Blob.
- `shared/secrets`: environment, mounted file, Azure Key Vault, AWS Secrets Manager, HashiCorp Vault, and Kubernetes Secret references.
- `shared/object-vocabulary`: configurable business phrase to qualified PostgreSQL object mapping.
- `diagnose-postgres/scripts`: classification, SQL safety validation, context comparison, and data-minimizing summaries.

The committed examples are templates. Do not commit passwords, connection strings, production host inventories, or query results.

## Evidence and token footprint

Research window: September 4, 2024 through September 4, 2026.

| PostgreSQL community area | Distinct cases |
|---|---:|
| Catalog, schemas and objects | 12 |
| Roles, ownership and security | 10 |
| Queries, plans and indexes | 12 |
| Transactions and maintenance | 13 |
| Replication and recovery | 10 |
| **Total** | **57** |

The entrypoint is 206 words, approximately 275 tokens. Evidence shards, patterns and SQL probes are loaded only when selected.
