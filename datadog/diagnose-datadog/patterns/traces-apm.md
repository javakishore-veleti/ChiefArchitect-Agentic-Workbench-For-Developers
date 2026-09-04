# Traces and APM

1. Establish deploy/version and latency/error-rate change points from metrics before retrieving traces.
2. Check tracer/Agent compatibility, service naming, propagation, inferred/proxy spans, partial flush, head sampling, ingestion controls, and retention filters.
3. Compare p50/p95/p99 and errors by operation, resource, availability zone, version, and dependency.
4. Treat a missing span as potentially sampled, dropped, late, mis-tagged, or uninstrumented.
5. Correlate logs only through trace/span identifiers; do not broaden to unrestricted service logs.

Use `knowledge/evidence.jsonl` with `area=traces-apm`.
