# Shopify agentic workbench

Shared Shopify configuration, secret resolution and authentication support every Shopify domain skill.

| Foundation | Purpose |
|---|---|
| `shared/config` | Map named configurations to lists of arbitrary environments and resolve storefront setup |
| `shared/secrets` | Resolve secret references through environment, files, Azure, AWS, HashiCorp Vault or Kubernetes |
| `shared/auth` | Use supplied Admin tokens or exchange client credentials and cache tokens in memory |
| `admin-api` | Diagnose Admin GraphQL behavior through one exposed router |

Configuration never contains secret values. Provider adapters use the runtime's existing workload identity or mounted secret delivery.
