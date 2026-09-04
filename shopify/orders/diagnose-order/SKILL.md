---
name: shopify-diagnose-order
description: Diagnose Shopify order retrieval, lifecycle, payment, fulfillment, return, refund, webhook, Markets and B2B discrepancies.
---

# Diagnose a Shopify order

1. Resolve `config-name` plus environment with `shopify/shared/config/load-config.mjs`; never infer a shop or reuse another environment's credentials.
2. Run `scripts/classify-order-issue.mjs` and read only its highest-scoring `patterns/` file. Load `knowledge/community-cases.json` only when comparable cases are needed.
3. Start with `queries/order-diagnostic.graphql`. Minimize protected customer data and redact it from evidence.
4. Compare original versus current money, quantities and lifecycle states. Correlate fulfillment-order line IDs, transactions, refunds, returns, events and webhook identifiers rather than assuming one status explains the order.
5. Capture HTTP status, GraphQL errors, `userErrors`, request ID, API version, shop, timestamps and query cost. Validate any forum hypothesis against current Shopify documentation.
6. Report finding, evidence, confidence, unresolved gaps and the smallest safe next action.

Reads are the default. Never create, edit, cancel, capture, refund, return, fulfill or close an order without explicit authorization for that operation and resolved shop. Use `--allow-mutation` only after authorization.
