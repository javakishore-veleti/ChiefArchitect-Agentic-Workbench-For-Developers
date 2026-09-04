---
name: shopify-storefront-api
description: Diagnose cross-cutting Shopify Storefront GraphQL authentication, context, publication, version, throttling, Hydrogen transport and response failures; route resource-specific failures to their domain skill.
---

# Shopify Storefront API diagnosis

1. Resolve `config-name` plus the caller-supplied environment through `shopify/shared/config/load-config.mjs` and `resolve-config.mjs`. Accept `--override-uri` or `SHOPIFY_CONFIG_OVERRIDE_URI`; never assume environment names, shops, storefronts, or Hydrogen apps.
2. Run `scripts/classify-issue.mjs`. If it returns a domain route, stop here and use that domain skill. Otherwise read only its matched file under `patterns/`.
3. Reproduce with the smallest read-only query through `scripts/run-storefront-graphql.mjs`. Select the Hydrogen app when credentials differ. Never print tokens.
4. Capture HTTP status, content type, Shopify request ID, GraphQL errors, warnings, and throttle metadata. A 200 response is not success when the body is HTML or contains GraphQL errors.
5. Compare the same variables and buyer context when testing environments or API versions. Treat forum reports in `knowledge/community-cases.jsonl` as leads; verify against current official docs and direct evidence.
6. Return finding, evidence, confidence, unresolved gaps, and the least-risk next check.

Mutations require explicit authorization for the exact target and `--allow-mutation`.

