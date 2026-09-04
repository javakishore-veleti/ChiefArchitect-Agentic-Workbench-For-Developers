---
name: diagnose-shopify-customer
description: Diagnose Shopify customer identity, profile, access, and cross-storefront failures while keeping Admin, Storefront, and Customer Account API evidence separate.
---

# Diagnose Shopify customer

Resolve `config-name` plus environment through `shopify/shared` before investigating. Never infer a shop, Hydrogen app, API version, credential, or customer identifier from another environment.

1. Run `scripts/classify-customer-issue.mjs --text '<symptom>'`.
2. Read only the returned pattern file. If confidence is low, read `patterns/api-boundaries.md` first.
3. Build a read-only probe with `scripts/build-customer-query.mjs --surface <surface> --mode <mode>`. Do not send mutations, passwords, tokens, authorization codes, cookies, or raw PII to logs or reports.
4. Capture HTTP status, request ID, GraphQL top-level errors, payload `userErrors`, granted scopes, API version, account model, and sanitized identifiers. Treat a `200` response as transport success—not operation success.
5. Use `scripts/summarize-customer-response.mjs` for a deterministic, redacted evidence summary.
6. Compare environments only after separately resolving each configuration. Report configuration differences; never copy credentials or customer data between shops.

API boundary is mandatory:

- **Admin GraphQL API:** merchant/app view of customer records; requires Admin auth, scopes, and possibly protected-customer-data approval.
- **Customer Account API:** current customer-authenticated profile, addresses, and orders through OAuth/OIDC.
- **Storefront API legacy customer operations:** password/customer-access-token flows; diagnose only when the store actually uses legacy accounts and flag migration risk.

Load `research/community-issues.jsonl` only to match a symptom to precedent. Community reports are clues, not proof. Verify conclusions against the linked official documentation and the target shop's evidence.
