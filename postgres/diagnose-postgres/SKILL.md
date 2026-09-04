---
name: diagnose-postgres
description: Diagnose PostgreSQL connectivity, authorization, object metadata, query plans, locking, maintenance, and replication in a precisely selected database context.
---

# Diagnose PostgreSQL

Resolve `environment -> cluster -> database -> connection context -> schema -> object` before querying. Never infer an unqualified object, role, database, or production target when more than one match exists.

1. Load the base config and optional override with `postgres/shared/config/load-config.mjs`; resolve one context with `resolve-config.mjs`.
2. If the request uses a business term, resolve it through `postgres/shared/object-vocabulary/resolve-object-term.mjs`.
3. Run `scripts/classify-postgres-issue.mjs` and read only the selected file named by `patterns/index.json`.
4. Use the narrowest read-only probe. Validate proposed SQL with `scripts/validate-sql-plan.mjs` before execution.
5. Report resolved context, observations, evidence, likely cause, confidence, and safe next checks. Keep facts separate from hypotheses.

In production, require a positive `statement_timeout` and a read-only transaction. Do not execute mutations, DDL, multiple statements, `COPY ... PROGRAM`, `DO`, `CALL`, `EXPLAIN ANALYZE`, backend termination, or unsafe `SECURITY DEFINER`/`search_path` operations. Treat a primary/unique constraint and its backing index as related but distinct. PostgreSQL `CLUSTER` is a one-time physical rewrite, not a continuously maintained clustered index.

Load community evidence only when a selected pattern calls for it. Never send credentials, row data, or unrestricted catalog dumps to the model.
