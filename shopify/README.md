# Shopify agentic workbench

Shared Shopify configuration, secret resolution and authentication support every Shopify domain skill.

| Foundation | Purpose |
|---|---|
| `shared/config` | Map named configurations to environments, load external overrides and resolve storefront setup |
| `shared/secrets` | Resolve secret references through environment, files, Azure, AWS, HashiCorp Vault or Kubernetes |
| `shared/auth` | Resolve explicit providers or scoped environment-variable defaults; obtain and cache Admin tokens in memory |
| `admin-api` | Diagnose Admin GraphQL behavior through one exposed router |

Configuration never contains secret values. Provider adapters use the runtime's existing workload identity or mounted secret delivery.
