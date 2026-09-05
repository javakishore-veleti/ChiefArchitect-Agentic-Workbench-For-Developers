---
name: diagnose-cart
description: Diagnose Shopify Storefront API, Hydrogen, and theme cart failures across configured storefronts and environments without mutating carts by default.
---

# Diagnose Shopify cart

Resolve exactly one storefront/environment through `../../shared/config/load-config.mjs` and `resolve-config.mjs`; accept `--override-uri` or `SHOPIFY_CONFIG_OVERRIDE_URI`. Never infer another environment, shop, Hydrogen app, market, or credential scope.

1. Classify the symptom with `scripts/classify-cart-issue.mjs`; read only the returned files in `patterns/`.
2. Prefer `queries/cart-diagnostic.graphql` and compare the cart, buyer context, market/currency, lines, discounts, delivery groups, and timestamps. Collect HTTP/GraphQL errors, mutation `userErrors`, and `warnings` separately.
3. Use `scripts/summarize-cart-response.mjs` for compact evidence. Use `compare-cart-contexts.mjs` only when two captured responses exist.
4. Distinguish persisted cart state from Hydrogen/theme/session rendering. A successful mutation plus stale UI is not an API mutation failure.
5. Report facts, likely cause with confidence, missing evidence, and the smallest verification step. Cite request IDs and source URLs; redact tokens, customer data, cart key material, and signed URLs.

All mutations are blocked unless the operator explicitly supplies `--allow-mutation` after approval. Do not run a mutation merely to reproduce a failure. Community reports in `knowledge/community-cases.json` are symptom precedents, not proof; verify conclusions against current Shopify documentation linked in `references/official-docs.md`.

