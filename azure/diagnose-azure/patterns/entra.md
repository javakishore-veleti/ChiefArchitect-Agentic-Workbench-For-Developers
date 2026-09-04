# Microsoft Entra ID

Load this pattern for sign-in, token acquisition, workload identity, application permission, consent, audience, federation, cache, or authorization failures.

## Evidence to collect

- Resolved environment, tenant ID, application/client ID, service principal object ID, identity type and requested resource/scopes. Keep IDs distinguishable.
- Sanitized Entra error code, correlation ID, trace ID and UTC timestamp; never collect access tokens, refresh tokens, assertions or client secrets.
- App registration and enterprise application metadata: account type, redirect URIs, credential expiry, API permissions, consent state, owners and assignment requirement.
- Credential-chain attempt order and selected credential; for federation, issuer, subject, audience, service account and projected-token file metadata.
- Token claims only from an approved redacted decoder: tenant, audience, issuer, app/client ID, subject/object ID, scopes/roles and expiry.
- Relevant sign-in logs and workload/application logs matched by correlation ID and time.

## Diagnose

1. Establish tenant, client, principal, environment and resource before interpreting an error. Never treat client ID and object ID as interchangeable.
2. Separate authentication from authorization: no token, invalid token, valid token with wrong audience/tenant, missing delegated scope/application role, or downstream RBAC denial.
3. For credential-chain failures, show each attempted credential and why it was unavailable. Detect accidental developer, CLI or managed-identity fallback.
4. For workload identity, compare federated credential issuer, exact subject and audience with the cluster OIDC issuer and service account; confirm webhook/token projection occurred.
5. For consent errors, compare declared permission type, granted tenant consent, requested scopes and calling flow. Do not propose broad permissions as a shortcut.
6. For intermittent or stale-token behavior, compare clock skew, expiry, cache key, refresh path, claims challenge and SDK versions.
7. Correlate Entra and application telemetry; state whether evidence proves configuration, identity selection, federation, consent, token validation or downstream authorization failure.

## Guardrails

Use read-only directory and sign-in-log queries by default. Redact credentials and token bodies. Do not add credentials, grant consent, alter federated credentials, assign roles, disable accounts, revoke sessions, or change conditional-access policy without explicit authorization and a reviewed plan.

Use `../knowledge/entra-issues.jsonl` only for matching symptoms; validate current product behavior and configuration independently.
