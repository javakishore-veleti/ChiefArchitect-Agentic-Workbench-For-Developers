---
name: diagnose-angular
description: Diagnose Angular application behavior across components, signals, forms, SSR, routing, RxJS, HTTP, authentication, testing, and builds using bounded evidence and an exact deployment context.
---

# Diagnose Angular

Resolve `environment + application + deployment` with `angular/shared/config/resolve-config.mjs`. Load an optional complete-entry override through `ANGULAR_CONFIG_OVERRIDE_URI`; never expose credentials or configuration values marked sensitive.

Classify the symptom with `scripts/classify-issue.mjs`, then read only the selected file from `patterns/index.json`. Consult a relevant `knowledge/` shard only when community evidence will change the diagnosis.

Resolve business phrases with `angular/shared/vocabulary/resolve-term.mjs`; fail on ambiguity. Use its repo paths, route, component, service, API mapping, or log fields only as search boundaries—not as proof.

Before running a proposed action, use `scripts/validate-plan.mjs`. Diagnostics are read-only by default. Deployments, browser writes, secret/config disclosure, destructive npm/git operations, and source mutations require explicit authorization and an exact target.

Gather the smallest evidence set that distinguishes likely causes. Report the resolved context, observations, likely cause and confidence, contradictions, and next safe action. Compare environments without returning secrets.
