---
name: diagnose-databricks
description: Diagnose or assess Databricks data, governance, compute, SQL, AI, sharing, reliability, and cost concerns across configured accounts, workspaces, environments, and workloads.
---

# Diagnose Databricks

Resolve scope before querying: config, environment, account, workspace, cloud, region, catalog, schema, workload, and time window. Use `DATABRICKS_WORKBENCH_CONFIG` when supplied; otherwise use the repository template plus `DATABRICKS_*` environment variables. Never print credentials.

Read only the matching entry in `patterns/index.json`, then its referenced pattern. Treat `knowledge/evidence.jsonl` as investigation leads, not proof of the current incident. Prefer current workspace evidence and official documentation.

Begin read-only: inventory configuration, permissions, lineage, events, query/job/pipeline history, serving telemetry, and billing usage. Run generated commands only after `scripts/validate-plan.mjs` accepts a JSON plan. Mutations require explicit authorization, exact target, rollback, and environment guardrails; never silently retry writes.

Separate observed facts, hypotheses, and recommended checks. Correlate by run, request, query, pipeline, model, table, and trace identifiers. Redact output with `scripts/redact.mjs`.

For 2026 announcements, read `references/2026-platform-notes.md`; preserve GA, Preview, Beta, and coming-soon labels and verify regional/cloud availability before recommendation.

Return: resolved scope, symptom, evidence timeline, ranked causes with confidence, safe next checks, and authorized remediation plan.

