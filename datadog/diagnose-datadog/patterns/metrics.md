# Metrics

1. Verify metric type, aggregation, rollup, interval, source, units, and tag availability.
2. Compare raw source and Datadog submission counts; check timestamp skew, Agent checks, mapper rules, and distribution configuration.
3. Diagnose cardinality through tag-value counts and usage estimates; never enumerate unbounded customer/resource identifiers.
4. Explain interpolation, sparse series, delayed cloud metrics, and monitor evaluation windows before calling data missing.
5. Prefer low-cardinality universal service tags; retain high-cardinality identifiers in traces/logs when possible.

Use `knowledge/evidence.jsonl` with `area=metrics`.
