# Query plans and statistics

Use this pattern for unexpected plans, cardinality errors, post-upgrade regressions, sorts or hashes spilling to disk, and ineffective parallel plans.

## Evidence to collect

1. Record `server_version_num`, database, effective role, `search_path`, relevant planner settings, and whether the statement is prepared.
2. Start with `EXPLAIN (FORMAT JSON, SETTINGS, VERBOSE)`; it does **not** execute the statement. Never add `ANALYZE` by default.
3. If execution is explicitly authorized in a safe environment, use `EXPLAIN (ANALYZE, BUFFERS, WAL, SETTINGS, FORMAT JSON)` and state that volatile functions and data-changing CTEs will execute.
4. Compare estimated and actual rows at every node, accounting for `Actual Loops`. Large ratios near the first divergence usually matter more than later symptoms.
5. Inspect `pg_stats`, extended statistics, last analyze time, statistics targets, parameter values/types, and generic versus custom prepared plans before changing planner cost constants.
6. Treat temp blocks, external merge sort, hash batches greater than one, and peak memory as spill evidence. `work_mem` applies per operation and potentially per worker, not once per query.
7. Compare workers planned with workers launched. A parallel-looking plan may run with fewer workers, and parallel overhead can make small queries slower.

## Conclusions

Separate observations from hypotheses. Do not prescribe `ANALYZE`, a higher statistics target, more `work_mem`, disabled plan types, or altered parallel costs until evidence identifies the affected relation and node. For version regressions, compare plans and settings on equivalent data rather than relying on total duration alone.

