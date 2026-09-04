---
name: diagnose-datadog
description: Diagnose Datadog telemetry, application, digital-experience, incident, AI-observability, security, and cost issues across dynamically resolved organizations and environments.
---

# Diagnose Datadog

Resolve the organization, site, environment, service, and UTC time window before querying. Load `datadog/shared/config/datadog-config.example.json` or `DATADOG_DIAGNOSTICS_CONFIG`; merge an optional `--override-uri` or `DATADOG_DIAGNOSTICS_CONFIG_OVERRIDE_URI` using `scripts/resolve-context.mjs`. Never infer a production target.

Run `scripts/classify-issue.mjs`. Read only its selected file from `patterns/index.json`; add `patterns/cross-signal.md` only when correlation crosses signals. Check configured capabilities: a documented or announced feature is not proof that this organization has it enabled.

Start with metadata, tags, counts, and narrow aggregates. Expand to bounded logs, traces, metrics, RUM sessions, synthetic results, monitor history, or incident timelines only as evidence requires. Correlate by `service`, `env`, `version`, trace/session/request ID, deployment identity, and UTC time. Distinguish absence, ingestion delay, sampling, retention, permissions, and malformed telemetry.

Use read-only APIs by default. Validate every proposed query or command with `scripts/validate-plan.mjs`; redact with `scripts/redact-evidence.mjs`. Never expose API/application keys, tokens, credentials, unrestricted payloads, session contents, or sensitive personal data. Mutations and autonomous remediation require separate authorization for exact targets.

Return resolved scope, finding, observations, inference, confidence, gaps, and next safe probe.
