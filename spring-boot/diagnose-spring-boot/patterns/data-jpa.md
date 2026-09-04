# Spring Data JPA and persistence

Use when the evidence mentions repositories, derived or native queries, paging/count queries, entity identity, projections, lazy loading, JDBC pools, or schema migration startup.

## Establish the boundary

Record Spring Boot, Spring Data JPA, Hibernate, JDBC driver, database, migration-tool, and JVM versions. Identify the repository method, entity mapping, generated SQL, transaction boundary, active datasource, and whether the failure appeared after an upgrade. A report in a Spring repository is not proof that Spring owns the defect; retain its disposition from `knowledge/data-transactions-cache.jsonl`.

## Diagnose

- Derived/native query: capture the method signature, `@Query`, parameters, `Pageable`/`Sort`, generated value query, generated count query, and bindings. Reproduce without pagination before changing mappings.
- Mapping: qualify entity, identifier/embedded identifier, converter, association fetch mode, and owning side. A `LazyInitializationException` establishes access outside an open persistence context, not its architectural remedy.
- N+1: compare statement count for a fixed result size. Test an entity graph, fetch join, projection, or batch fetching independently; do not globally switch associations to eager.
- Pool: compare acquisition time, active/idle/pending connections, maximum pool size, transaction duration, leak detection, database limits, and datasource property binding. Pool exhaustion may be a symptom of leaked or long transactions.
- Migration: separate Boot auto-configuration from Flyway/Liquibase/database compatibility. Capture the first migration exception and version matrix; do not rerun, repair, clean, or modify schema without explicit authorization.

## Return

State the resolved application/environment/datasource, observed SQL or startup evidence, likely owning layer, confidence, lowest-risk verification, and any unresolved ambiguity. Keep query plans and data values redacted where required.

