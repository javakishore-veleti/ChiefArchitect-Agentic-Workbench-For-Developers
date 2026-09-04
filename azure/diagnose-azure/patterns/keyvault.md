# Key Vault

Load this pattern for missing secrets, certificate/key access, authorization, rotation, latency, or private-endpoint failures.

## Evidence to collect

- Resolved subscription, tenant, environment, vault URI, consuming workload, identity type and client ID. Never collect secret values.
- Vault RBAC mode, relevant role assignments or access policies, deny assignments, and their scopes.
- Secret/key/certificate name, enabled state, current version metadata, expiry and rotation-policy metadata.
- Caller-side credential-chain diagnostics and sanitized HTTP status, error code, request ID and timestamp.
- DNS resolution, private-endpoint approval, private DNS zone/link, firewall/public-access state and route evidence from the workload network.
- SDK/runtime versions and whether the failure affects metadata operations, data-plane access, or framework property loading.

## Diagnose

1. Prove the selected tenant, subscription, vault and workload environment; do not infer them from a friendly name.
2. Identify the credential actually selected. Distinguish system-assigned identity, user-assigned identity, workload identity, service principal and developer credential fallback.
3. Classify the boundary: token acquisition, DNS/TCP/TLS, Key Vault authorization, object/version state, SDK integration, or application configuration binding.
4. For `401`, compare tenant, token audience and authority. For `403`, compare authorization mode, principal object ID, role/policy scope, deny assignments and propagation time.
5. For timeout or `ForbiddenByConnection`, trace DNS and private-endpoint routing from the actual caller. Portal access is not proof of workload connectivity.
6. For a missing value, inspect object metadata and framework mapping without printing the value. Check disabled/expired versions, soft deletion, naming normalization and property-source precedence.
7. Correlate the request ID and timestamp with Key Vault diagnostic logs; rank conclusions by direct evidence.

## Guardrails

Default to metadata-only reads. Redact tokens, secret values, certificate private material and credentials. Do not create role assignments, change firewall rules, enable versions, recover/purge objects, rotate keys, or restart workloads without explicit authorization and a reviewed plan.

Use `../knowledge/keyvault-issues.jsonl` only when symptoms match; issue reports are diagnostic precedents, not proof of the current cause.
