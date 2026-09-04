---
name: shopify-diagnose-product
description: Diagnose Shopify product, variant, option, inventory, media, metafield, publication, search and bulk-operation failures across configured shops and environments.
---

# Shopify product diagnosis

For a configured metafield word or phrase, use `shopify/shared/metafields/resolve-metafield-term.mjs` with owner type `PRODUCT`, `PRODUCT_VARIANT`, or `COLLECTION`, then use `build-metafield-query.mjs`. Require an identified object and never guess a namespace, key, or unsupported value-search filter.

1. Resolve `config-name` plus environment with `shopify/shared/config/load-config.mjs`; never infer a shop, storefront, market, publication or Hydrogen app.
2. Run `scripts/classify-product-issue.mjs` and read only the first matched file in `patterns/`. Load a second only when its score ties.
3. Start with `queries/product-diagnostic.graphql` using one stable identifier and `scripts/run-product-query.mjs`, which delegates credential resolution to the shared Admin runner. Compare environments with `scripts/compare-products.mjs`; GIDs are shop-local, so compare handles, SKUs and option values.
4. Preserve top-level GraphQL errors, mutation `userErrors`, request ID and cost metadata. Use `scripts/summarize-product-response.mjs` for a redacted evidence summary.
5. Treat Community cases in `knowledge/community-cases.jsonl` as hypotheses. Confirm conclusions against the linked current Shopify documentation and the target API schema/version.

Default to read-only diagnosis. Never publish, mutate products/variants/options, adjust inventory, or change media without explicit authorization for the exact configuration, environment and impact.

Return: finding, evidence, confidence, unresolved gaps and safest next action.
