# Indexes and access methods

Use this pattern when an expected index is absent, the wrong index wins, an index-only scan still reads the heap, or partition indexes behave inconsistently.

## Checks

- Resolve the exact database, schema, table and effective role. Never infer an object from an unqualified name.
- Inventory index access method, key and included columns, expression, predicate, validity/readiness, uniqueness, constraint ownership and partition attachment with `queries/index-inventory.sql`.
- Match predicates structurally. A partial index is usable only when the query condition implies its predicate at planning time; parameters commonly prevent that proof.
- Check operator class, collation, casts and expression identity. An expression index is not a general substitute for multicolumn statistics.
- Check column order against equality and range conditions. PostgreSQL can use later columns, but they may not reduce the scanned portion of a B-tree.
- For index-only scans, inspect visibility-map coverage and heap fetches. `INCLUDE` can cover output columns but increases index size and write cost.
- For partitioned tables, verify every leaf index is attached and valid. The parent partitioned index contains no table data itself.
- Distinguish a constraint-backed index from an independent unique index before proposing changes.

PostgreSQL has no continuously maintained "clustered index". `CLUSTER table USING index` rewrites the heap once under an `ACCESS EXCLUSIVE` lock; later writes do not preserve physical order. Never run `CLUSTER`, `REINDEX`, `CREATE/DROP INDEX`, or planner-changing `SET` commands as diagnosis.

