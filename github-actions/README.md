# GitHub Actions diagnostic skills

`diagnose-github-actions` is the single skill exposed to the agentic harness. It routes to one conditional pattern, keeping detailed guidance and evidence out of the initial context.

| Route | Coverage |
|---|---|
| build / test | Triggers, matrices, toolchains, services, annotations and failures |
| security / supply-chain | Permissions, untrusted input, action pinning, attestations and immutable releases |
| deploy / rollback | Environments, gates, provenance, promotion and recovery |
| runner | Hosted/self-hosted images, groups, queueing, ARC, lifecycle and diagnostics |
| reusable-workflow | Callers, inputs, secrets, outputs, permissions and nesting |
| OIDC / environment | Claims, cloud trust, audiences and protection rules |
| artifact / cache | Paths, digests, retention, keys, scopes, races and compatibility |
| observability / cost | Run telemetry, queue time, reruns, billable usage and optimization |

The entrypoint is 216 words (approximately 288 input tokens). Detailed patterns load only after routing. The evidence catalog contains 41 distinct official GitHub documentation, changelog, and issue URLs, qualified as guidance or diagnostic precedent rather than proof of a platform defect.

Enterprise topology is data, not hardcoded skill logic. The configuration maps any environment names to named configurations containing organizations, repositories, workflows, runner groups, and environment-specific settings. Copy `shared/config/github-actions-config.example.json` as a credential-free template.

Use `GITHUB_ACTIONS_CONFIG_OVERRIDE_URI` or `--override-uri` for a non-repository override. Supported sources are local paths, `file://`, HTTPS, `s3://`, and `azblob://ACCOUNT/CONTAINER/BLOB`; provider CLIs use their existing workload identity. The skill never embeds credentials.

Diagnostics are read-only. Mutation requires an independently authorized workflow.
