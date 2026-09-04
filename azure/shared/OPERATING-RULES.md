# Azure Operating Rules

Use these rules when an Azure skill requires enterprise discovery, sensitive-data handling, or a proposed change.

- Discover setup dynamically. Never embed AKIV subscription, portfolio, program, environment or microservice inventories in a skill.
- Accept management group, subscription, portfolio, program, environment, region, resource, service, correlation ID and time-range filters when provided.
- Record inaccessible subscriptions and sources; never interpret missing access as an empty result.
- Normalize evidence with subscription, resource group, region, portfolio, program, environment, owner, resource ID and observation time when available.
- Separate observed facts from inference and state confidence and evidence gaps.
- Default to read-only work. Before any mutation, show the exact targets, expected impact, rollback and validation, then obtain explicit authorization.
- Never expose credentials, tokens, secret values, patient information or unnecessary sensitive payloads. Redact identifiers not required for engineering diagnosis.
- Prefer narrow queries and summaries. Retrieve detailed logs, manifests or records only when required by the active investigation.
