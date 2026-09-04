# Configuration

`DATABRICKS_WORKBENCH_CONFIG` may identify a local JSON file or an HTTPS, `s3://`, `az://`, or `abfs[s]://` object resolved by the harness. Downloaded overrides stay outside Git and require integrity and access controls.

The document uses `configs-envs-mapping` to reuse a named config across environments and `configs` for account/workspace/workload topology. Environment entries may override workspace, catalog, schema, warehouse, and secret references. A config can contain multiple workspaces and workloads; an environment can select one config. Unknown fields are preserved.

When no file is configured, build a minimal runtime config from `DATABRICKS_HOST`, `DATABRICKS_ACCOUNT_ID`, `DATABRICKS_WORKSPACE_ID`, `DATABRICKS_CATALOG`, `DATABRICKS_SCHEMA`, and standard Databricks authentication environment variables. Store only secret references in JSON.
