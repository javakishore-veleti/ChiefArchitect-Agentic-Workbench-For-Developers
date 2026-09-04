# Tables, columns, and types

Identify relation kind before diagnosing a table name: ordinary, partitioned, partition, view, materialized view, foreign table, or sequence. Preserve dropped-column gaps and generated/identity metadata when comparing catalogs.

For a column, resolve the declared type with `format_type`; separately report domain base type, domain constraints, enum labels/order, array element type, collation, nullability, default, identity, and generation expression. Do not flatten domains or enums to their storage type when explaining application behavior.

Use `queries/inspect-types.sql`; qualify every requested type by schema.
