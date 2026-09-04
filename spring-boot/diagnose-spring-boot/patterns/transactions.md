# Transactions

Use for commit/rollback surprises, propagation, multiple transaction managers, event listeners, JDBC/JPA mixing, reactive cancellation, nested/savepoint behavior, or connections retained past a boundary.

## Build the actual boundary map

Identify the invoked proxy method, caller, thread or reactive subscription, transaction manager, resource, propagation, isolation, read-only flag, timeout, rollback rules, and exception path. Self-invocation and objects created outside the container bypass proxy advice. Never infer a transaction from the annotation alone.

## Diagnose

- Verify which transaction manager was selected; with several managers, record each resource binding and synchronization owner.
- Distinguish `REQUIRED` participation, `REQUIRES_NEW` suspension plus a second connection, and `NESTED` savepoints. Confirm driver/database/savepoint support.
- For unexpected commit, capture the thrown type and whether it escaped the advised method; checked exceptions do not roll back by default unless configured.
- For unexpected rollback, find the first rollback-only marker rather than the final `UnexpectedRollbackException`.
- For `@TransactionalEventListener`, record phase and nested propagation. `BEFORE_COMMIT` plus `REQUIRES_NEW` can increase simultaneous connection demand.
- For Reactor/R2DBC, the transaction lives in subscriber context, not `ThreadLocal`; inspect cancellation, context loss, retries, and cleanup signals.
- When JDBC and JPA share a datasource, verify both use the transaction-bound connection before blaming Hikari.

## Safety and result

Do not retry non-idempotent work or change propagation as a diagnostic shortcut. Return a compact timeline: proxy entry, acquisition, suspend/savepoint, SQL, exception/cancel, rollback-only, completion, release. Separate observed facts from framework issue similarity.

