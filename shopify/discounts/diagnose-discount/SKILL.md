---
name: shopify-diagnose-discount
description: Diagnose Shopify discount configuration, eligibility, Functions, combinations, markets, B2B, and cart or checkout outcomes without changing discounts.
---

# Diagnose Shopify discounts

For a configured metafield term, use `shopify/shared/metafields/resolve-metafield-term.mjs` with owner type `DISCOUNT_CODE` or `DISCOUNT_AUTOMATIC`, then build the read-only object query with `build-metafield-query.mjs`. Never infer a namespace, key, or discount owner.

Resolve `config-name` and environment with `shopify/shared/config/load-config.mjs` and `resolve-config.mjs`. Never infer a shop, environment, Hydrogen app, market, company, or buyer.

1. Run `scripts/classify-discount-issue.mjs` with the symptom. Read only the returned `patterns/*.md` files.
2. Establish the discount method (code or automatic), implementation (native or app Function), class, status, schedule, buyer context, requirements, destinations, combinations, API version, and surface.
3. Use read-only Admin queries in `queries/` through the Admin API runner. For observed cart behavior, consume captured Storefront responses; leave cart lifecycle diagnosis to the cart skill.
4. Capture top-level GraphQL errors, mutation `userErrors`, request/cost metadata, Function output, discount allocations, and rejected-code messages when available.
5. Use `knowledge/community-cases.jsonl` only to find comparable symptoms. A forum report is a lead, not proof; confirm decisions against the linked official references and current schema.
6. Report finding, evidence, confidence, missing evidence, and the smallest next check. Compare environments by stable discount title/code/function handle and configuration—not GIDs.

Do not create, update, activate, deactivate, or delete a discount without explicit authorization for the exact shop and impact. Never expose tokens, customer data, or signed URLs.
