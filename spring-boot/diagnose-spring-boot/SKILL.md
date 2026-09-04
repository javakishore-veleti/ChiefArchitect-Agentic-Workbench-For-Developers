---
name: diagnose-spring-boot
description: Diagnose Spring Boot application failures, behavior, configuration, security, data access, messaging, tests, observability, and runtime issues across explicitly resolved enterprise environments and services.
---

# Diagnose Spring Boot

Resolve the application context before investigating. Require an environment plus either a configured service or an unambiguous business term. Use `spring-boot/shared/config/resolve-context.mjs`; load an external override only when supplied through `--override-uri` or `SPRING_BOOT_CONFIG_OVERRIDE_URI`.

Classify the symptom with `scripts/classify-spring-issue.mjs`, then read only the selected pattern named in `patterns/index.json`. Resolve organization terminology with `spring-boot/shared/vocabulary/resolve-term.mjs`; never guess an ambiguous service, module, endpoint, profile, or log field.

Gather the smallest useful evidence: application/version, active profiles, sanitized health, request/correlation ID, exception chain, HTTP status, relevant logs, dependency state, and repository module. Distinguish framework behavior from application code, configuration, infrastructure, and dependency failures. Compare environments only when the same service and probe can be matched safely.

Diagnostics are read-only by default. Run every proposed action through `scripts/validate-diagnostic-plan.mjs`. Never expose environment/configuration values or secrets; query only allowlisted sanitized Actuator endpoints. Block Actuator mutations, database/message destructive operations, unrestricted data reads, production restarts, deployments, scaling, configuration changes, and profile changes unless an external workflow obtains explicit authorization. This skill does not grant that authorization.

Summarize with redaction and report: resolved context, observed evidence, likely layer, confidence, excluded causes, and next safe probe. Do not label a community report as a confirmed Spring defect without maintainer or release evidence.

