# Logs

1. Compare intake, indexed, archived, and rehydrated counts for the same scoped tags and UTC interval.
2. Inspect pipeline/filter ordering, parsing status, reserved attributes, exclusion filters, quotas, and retention—not raw payloads first.
3. Separate shipper/Agent loss from network intake, pipeline drop, indexing exclusion, retention expiry, and permission denial.
4. For high volume, group by `service`, `env`, `status`, source, and estimated bytes before sampling examples.
5. Verify Sensitive Data Scanner and Observability Pipelines boundaries before displaying fields.

Use `knowledge/evidence.jsonl` with `area=logs`; source records are diagnostic precedents, not proof of the current cause.
