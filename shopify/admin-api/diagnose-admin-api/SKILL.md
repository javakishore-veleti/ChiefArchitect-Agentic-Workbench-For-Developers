---
name: shopify-admin-api
description: Diagnose Shopify Admin GraphQL queries, mutations, permissions, versions, filtering, throttling, timeouts and inconsistent results.
---

# Shopify Admin API diagnosis

1. Resolve environment, business storefront, Shopify shop, app, API version and time range. Do not assume one shop per environment or one storefront per shop.
2. Run `scripts/classify-issue.mjs` and read only the matched file in `patterns/`.
3. Prefer a minimal read-only reproduction. Use the referenced query or script and capture GraphQL errors, user errors, request ID and cost metadata.
4. Compare environments by stable business keys, never Shopify GIDs alone.
5. Validate community-derived hypotheses against current official documentation.
6. Return finding, evidence, confidence, gaps and next action.

Never expose tokens or customer data. Never run mutations without explicit authorization for the exact shop and impact.
