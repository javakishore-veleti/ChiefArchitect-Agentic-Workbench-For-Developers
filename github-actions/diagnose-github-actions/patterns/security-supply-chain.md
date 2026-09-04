# Security and supply chain

Inspect top-level and job `permissions`, event trust boundary, expression injection, untrusted checkout/ref use, secrets inheritance, action references, dependency-review/code-scanning results, release immutability, and artifact provenance. Flag `pull_request_target` that checks out attacker-controlled code, broad `write-all`, mutable third-party tags, persistent cloud credentials, and secret-bearing logs.

Prefer full commit-SHA pinning for third-party actions, Dependabot updates, OIDC, environment protection, artifact attestations, provenance verification before deployment, immutable releases, and narrowly scoped tokens. Never print tokens, attestations containing sensitive claims, or secret values.
