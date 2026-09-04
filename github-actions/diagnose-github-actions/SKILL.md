---
name: diagnose-github-actions
description: Diagnose and review GitHub Actions workflows, runs, runners, deployments, security, artifacts, caches, reusable workflows, OIDC, attestations, observability, and cost across explicitly resolved enterprise repositories and environments.
---

# Diagnose GitHub Actions

Resolve organization, repository, environment, and workflow before investigation. Use `scripts/resolve-context.mjs`; accept an external override only through `--override-uri` or `GITHUB_ACTIONS_CONFIG_OVERRIDE_URI`. Never infer an ambiguous production target.

Classify the symptom with `scripts/classify-issue.mjs`, then read only the selected file from `patterns/index.json`. Inspect the smallest useful evidence: run and attempt IDs, event, ref/SHA, workflow revision, job/step conclusion, runner labels/version, permissions, environment gates, dependency graph, annotations, artifacts, and sanitized logs.

Keep diagnosis read-only. Validate workflow text with `scripts/validate-workflow.mjs`, proposed operations with `scripts/validate-plan.mjs`, and output with `scripts/redact.mjs`. Treat reruns, approvals, dispatches, cancellations, cache deletion, environment changes, secret changes, release/deployment/rollback, runner registration, permission changes, and artifact deletion as mutations requiring explicit external authorization. This skill does not grant it.

Prefer immutable action references, least-privilege `GITHUB_TOKEN`, OIDC instead of long-lived cloud credentials, protected environments, reusable workflows, artifact attestations, immutable releases, ephemeral isolated runners, bounded retention, concurrency controls, and provenance verification where applicable. Confirm feature availability and current syntax in official documentation.

Report resolved scope, evidence, failing boundary, likely cause with confidence, excluded causes, and the next safe probe. Community issues are diagnostic precedents, not proof of a platform defect.
