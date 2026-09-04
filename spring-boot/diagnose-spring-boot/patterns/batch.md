# Spring Batch

Use this pattern for job/step lifecycle, chunk state, restart, readers/writers, repository concurrency, and Batch metadata schema or migration failures.

## Resolve the execution

Require application environment, Spring Batch version, job name and identifying parameters. Capture `JobInstance`, `JobExecution`, `StepExecution`, status/exit status, start/end/update times and sanitized failure exceptions. Identify the repository database and schema version; do not mix rows from jobs with similar names or non-identifying parameters.

## Chunk and restart

Reconcile four states for the failed chunk: reader position, processed/written counts, business-data commit, and persisted `ExecutionContext`. A database rollback does not prove that reader state also rolled back. On restart, compare the last committed item with the first item read and confirm deterministic ordering. For paginated readers include page size, saved index and stable sort keys. For skips/retries, distinguish read, process and write failures and verify listener callbacks inside their transaction scope.

## Concurrency and transactions

Record launcher count, partition/local-chunk mode, task executor, isolation, transaction manager, lock waits and optimistic-lock exceptions. A first launch and a restart may traverse different repository paths. Never recommend manually changing a running execution's status without an authorized recovery procedure and a consistency check of business data.

## Repository schema and migration

Compare the installed metadata schema with the exact framework release and database dialect. Preserve the failing statement, existing columns/indexes/constraints, parameter types, execution plan and migration history. Take a backup and test migrations outside production; do not rerun a partially applied script or run repository initialization against an existing schema. SQL Server type-conversion findings do not automatically apply to PostgreSQL or other dialects.

## Safe conclusion

State whether the likely layer is application item logic, transaction boundary, reader restart contract, repository concurrency, shipped DDL/migration, or database-specific behavior. Read matching records in `../knowledge/messaging-batch.jsonl` and preserve each record's evidence level; an open investigation is not a confirmed defect.
