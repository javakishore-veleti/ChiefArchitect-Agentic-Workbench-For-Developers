# Search, JSON, vector, and time-series

Load this pattern only for `FT.*`, JSON indexing, vector similarity, or `TS.*` symptoms. The traceable cases are in `../knowledge/redis-stack.jsonl`; they are evidence, not proof that a current incident has the same cause.

## Route

| Signal | Check first | Evidence |
|---|---|---|
| Vector cannot be decoded | Hash/JSON storage, byte order, schema `TYPE` and `DIM`, client return decoding | stack-001 |
| Known vector absent | Indexing status, prefix, vector dimensions, HNSW recall settings, exact FLAT comparison | stack-002 |
| Search latency during writes | Update rate, index size, shard hot spots, HNSW configuration, command latency | stack-003 |
| JSON field not searchable | Index JSONPath, array shape, aliases, tokenization, `FT.INFO` failures | stack-004 |
| `RETURN` plus `HIGHLIGHT` fails | Reduce to indexed fields; isolate JSONPath projection from highlighting | stack-005 |
| `FT.CREATE` schema rejected | Compare option ordering and supported server/module version | stack-006 |
| Aggregate timestamp surprises | Range bounds, bucket duration, `ALIGN`, bucket timestamp semantics | stack-007 |
| Time-series cluster inconsistent | Cluster topology, module version, reshard/import history, authentication | stack-008 |
| Label filter returns nothing | Exact label name and value; punctuation; test a simple label | stack-009 |
| `TS.RANGE` disconnects | Stop replay; capture bounds/options/version; test only in an isolated environment | stack-010 |

## Evidence workflow

1. Record Redis and module versions, deployment mode, index name, storage type, key prefix, command, sanitized arguments, response, and request time.
2. Use bounded read-only probes: `FT.INFO`, `FT.EXPLAIN`, `FT.SEARCH ... LIMIT`, `TYPE`, `JSON.TYPE`, `TS.INFO`, and a narrow `TS.RANGE`.
3. Reproduce against one known key. For vector recall, compare HNSW with an equivalent FLAT test dataset before calling data “missing.”
4. Distinguish schema/query mistakes, documented approximate-search tradeoffs, version limitations, and suspected defects. Preserve the matching evidence ID and exact source URL.
5. Do not run broad searches, rebuild/drop indexes, rewrite JSON, or replay a crash-triggering command in production without explicit authorization.

## Report

Return context, observed symptom, minimal probe results, likely category, confidence, matching evidence IDs, official documentation, and the next safe check. Never present an open or stale report as a confirmed Redis defect.
