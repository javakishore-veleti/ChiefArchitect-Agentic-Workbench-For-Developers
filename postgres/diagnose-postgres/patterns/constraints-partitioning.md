# Constraints and partitioning

Distinguish primary, unique, foreign-key, check, exclusion, and not-null constraints. Record `convalidated`, `condeferrable`, `condeferred`, enforcement state when available, referenced columns, and delete/update actions. A foreign key does not automatically index its referencing columns.

For partitioned relations, report partition key, bound, parent chain, leaf partitions, and whether indexes/constraints are attached. A sequence-generated identity does not enforce cross-partition uniqueness. Unique and primary-key constraints on a partitioned table generally must include all partition-key columns.

Use `queries/inspect-table-constraints.sql` and, only when partition context is relevant, `queries/inspect-partition-tree.sql`. Each is a separately validated statement. Do not validate, attach, detach, or rebuild anything without separate change authorization.
