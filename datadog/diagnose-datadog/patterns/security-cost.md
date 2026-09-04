# Security and Cost

1. For security, inspect detection/rule metadata, identity, asset, technique, and bounded event counts before raw evidence.
2. Confirm scanner/redaction coverage and access controls; never reveal detected secret or sensitive value.
3. For cost, reconcile usage by product, organization, source, environment, service, and tag coverage.
4. Attribute log, custom-metric, indexed-span, RUM/session, synthetic, and container growth to configuration or workload changes.
5. Propose retention, sampling, exclusion, aggregation, or tag changes with observability impact; never apply them automatically.

Use `knowledge/evidence.jsonl` with `area=security-cost`.
