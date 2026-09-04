# Shopify agentic workbench

Shared Shopify configuration, secret resolution and authentication support every Shopify domain skill.

| Foundation | Purpose |
|---|---|
| `shared/config` | Map named configurations to environments, load external overrides and resolve storefront setup |
| `shared/secrets` | Resolve secret references through environment, files, Azure, AWS, HashiCorp Vault or Kubernetes |
| `shared/auth` | Resolve explicit providers or scoped environment-variable defaults; obtain and cache Admin tokens in memory |
| `shared/metafields` | Configure business terms and aliases that resolve to typed Shopify owner, namespace and key coordinates |
| `admin-api` | Diagnose Admin GraphQL behavior through one exposed router |

Configuration never contains secret values. Provider adapters use the runtime's existing workload identity or mounted secret delivery.

## Diagnostic skills

Only the compact `SKILL.md` entrypoint is loaded initially. Pattern guidance and community evidence are loaded after classification.

| Domain | Exposed skill | Entrypoint words | Approx. tokens* | Community cases |
|---|---|---:|---:|---:|
| Admin API | `shopify-diagnose-admin-api` | 119 | 160 | 29 |
| Carts | `shopify-diagnose-cart` | 192 | 255 | 40 |
| Products | `shopify-diagnose-product` | 203 | 270 | 30 |
| Customers | `diagnose-shopify-customer` | 271 | 360 | 38 |
| Orders | `shopify-diagnose-order` | 199 | 265 | 30 |
| Discounts | `shopify-diagnose-discount` | 232 | 310 | 36 |
| Storefront API | `shopify-storefront-api` | 180 | 240 | 35 |

\*Approximation at 0.75 words per token; actual tokenizer usage varies. Case files are not part of the default input.
