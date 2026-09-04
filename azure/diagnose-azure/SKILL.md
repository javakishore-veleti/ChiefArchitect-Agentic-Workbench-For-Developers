---
name: diagnose-azure
description: Diagnose Azure application and platform issues across dynamically resolved tenants, subscriptions, environments, applications, AKS, ACR, Key Vault, Redis, Cosmos DB, Entra, and Application Insights.
---

# Diagnose Azure

Resolve scope before querying Azure. Require an environment and either a configured application/resource or an unambiguous resource ID. Load `azure/shared/config/azure-config.example.json`, or the path in `AZURE_DIAGNOSTICS_CONFIG`; apply an optional external override from `--override-uri` or `AZURE_DIAGNOSTICS_CONFIG_OVERRIDE_URI`. Run `azure/shared/config/resolve-context.mjs`; never infer a tenant, subscription, or production target.

Classify the symptom with `scripts/classify-azure-issue.mjs`. Read only the route selected from `patterns/index.json`; a route may point to an existing leaf skill. Load `patterns/cross-service.md` only when evidence spans services.

Start with Azure Resource Graph or narrowly scoped metadata. Add Azure CLI, Kubernetes, KQL, control-plane events, and application telemetry only as needed. Record inaccessible scopes rather than treating them as empty. Correlate evidence by immutable resource ID, environment, deployment/image identity, correlation ID, and UTC time.

Default to read-only diagnostics. Validate proposed commands with `scripts/validate-diagnostic-plan.mjs`. Never retrieve secret values, tokens, patient data, unrestricted logs, or full configuration payloads. Redact output with `scripts/redact-evidence.mjs`. Any mutation requires separate explicit authorization for exact targets; this skill does not grant it.

Return the finding, resolved scope, observations, inference, confidence, gaps, and next safe probe.
