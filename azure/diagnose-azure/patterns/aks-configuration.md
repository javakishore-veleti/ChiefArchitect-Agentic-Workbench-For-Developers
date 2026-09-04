# AKS configuration

Use for ConfigMap, workload environment, feature flag, proxy, add-on, policy or environment-drift issues.

## Evidence sequence

1. Resolve application/environment to cluster, namespace and workloads; identify expected configuration source and revision.
2. Inventory ConfigMap names, workload references, mounted paths, env keys, checksums and restart/reload mechanism. Report names and hashes, not sensitive values.
3. Compare declared Git revision, rendered manifest and live metadata; classify intentional overlays separately from drift.
4. Inspect events, admission/policy decisions and application startup evidence for missing keys, invalid formats or stale mounts.
5. Trace external configuration dependencies and proxy/no-proxy behavior only through redacted metadata.

## Decision rules

- A changed ConfigMap does not prove pods consumed it: verify mount projection, env immutability or reload evidence.
- Missing key and wrong namespace are distinct causes.
- Separate platform/add-on configuration from application configuration and ownership.
- Do not infer drift from values designed to differ by environment.

## Output

Return source precedence, expected/observed hashes, consuming workloads, first divergence, ownership, confidence and safe next checks. Never print secret-looking values or patch live configuration.
