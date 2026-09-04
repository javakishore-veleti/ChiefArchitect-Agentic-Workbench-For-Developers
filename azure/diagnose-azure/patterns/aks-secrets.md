# AKS secrets

Use for Key Vault CSI, workload identity, Kubernetes Secret references, certificate expiry, mount or rotation failures.

## Evidence sequence

1. Resolve workload, service account, SecretProviderClass, vault reference, object names and identity; never retrieve secret values.
2. Read pod volume/env references, CSI driver/provider health, mount events and redacted Secret metadata.
3. Verify federated credential subject/audience/issuer, managed identity assignment, Key Vault RBAC/access and private connectivity.
4. Compare certificate metadata, versions and timestamps with pod mount/sync observations; retain only IDs, hashes and expiry.
5. Distinguish authentication, authorization, network, object-not-found, format and rotation propagation failures.

## Decision rules

- `driver not found`: check CSI registration/node health before vault permissions.
- `403`: prove the calling identity and authorization model; do not broaden access speculatively.
- Mounted but stale: trace provider polling, object version, synced-secret behavior and application reload.
- A Kubernetes Secret existing does not prove the CSI mount or application consumed the intended version.

## Output

Return secret references, resolved identity, authorization/network observations, version metadata, first failing hop and safe next checks. Never reveal values, tokens, private keys or certificate bodies; never rotate automatically.
