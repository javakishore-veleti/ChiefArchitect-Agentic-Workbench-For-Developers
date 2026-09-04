# Chief Architect Agentic Workbench for Developers

Repository-scoped engineering diagnostics for Shopify, Spring Boot, Angular, PostgreSQL, Redis, Azure, Databricks, Datadog and GitHub Actions.

## Harness support

The technology folders contain the canonical skills, patterns, scripts, configuration schemas and evidence. Discovery folders contain small adapters only; they do not duplicate the implementation.

| Harness | Discovery path | Ready after clone |
|---|---|---|
| Codex CLI and IDE | `.agents/skills/` | Yes |
| Cursor | `.agents/skills/` | Yes |
| Google Antigravity | `.agents/skills/` | Yes |
| Claude Code CLI | `.claude/skills/` | Yes |
| GitHub Copilot | `.github/skills/` | Yes |
| Other Agent Skills-compatible tools | `.agents/skills/` | Usually; verify the tool's discovery path |
| Hermes Agent | GitHub install or repository tap | See [`integrations/hermes`](integrations/hermes/) |

Each harness initially sees only the adapter name and description. After selecting an adapter, it reads the canonical router and then only the relevant pattern. This prevents every technology subcategory from entering the prompt.

Examples after opening the repository in a supported harness:

```text
Diagnose the QA AKS ImagePullBackOff using azure-diagnostics.
Trace this Shopify order failure using shopify-order.
Explain the failed deployment using github-actions-diagnostics.
```

Run `node scripts/validate-harness-skills.mjs` after adding or renaming an entrypoint.

## Available entrypoints

`angular-diagnostics`, `azure-diagnostics`, `databricks-diagnostics`, `datadog-diagnostics`, `github-actions-diagnostics`, `postgres-diagnostics`, `redis-diagnostics`, `shopify-admin-api`, `shopify-cart`, `shopify-customer`, `shopify-discount`, `shopify-order`, `shopify-product`, `shopify-storefront-api`, and `spring-boot-diagnostics`.
