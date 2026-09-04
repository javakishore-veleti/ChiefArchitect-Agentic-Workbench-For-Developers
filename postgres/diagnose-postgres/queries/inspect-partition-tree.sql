-- psql variables: schema_name, table_name. One read-only statement.
SELECT tree.relid::regclass AS partition, tree.parentrelid::regclass AS parent,
       tree.level, tree.isleaf,
       pg_get_expr(child.relpartbound, child.oid, true) AS partition_bound
FROM pg_catalog.pg_partition_tree(
       to_regclass(format('%I.%I', :'schema_name', :'table_name'))
     ) AS tree
JOIN pg_catalog.pg_class child ON child.oid = tree.relid
ORDER BY tree.level, tree.relid::regclass::text;
