---
name: diagnose-admin-api
description: Diagnose Shopify Admin GraphQL queries, mutations, permissions, versions, filtering, throttling, timeouts and inconsistent results.
---

# Shopify Admin API diagnosis

1. Resolve the named configuration and environment through `shopify/shared/config/resolve-config.mjs`; never assume fixed environments, storefronts, shops or secret providers.
2. Run `scripts/classify-issue.mjs` and read only the matched `patterns/` file.
3. Prefer a minimal read-only reproduction. The shared auth layer resolves credentials and obtains the Admin token without printing it.
4. Capture GraphQL errors, user errors, request ID and cost metadata. Compare shops by stable business keys, not GIDs alone.
5. Validate community hypotheses against official documentation. Return finding, evidence, confidence, gaps and next action.

Never run mutations without explicit authorization for the exact shop and impact.
