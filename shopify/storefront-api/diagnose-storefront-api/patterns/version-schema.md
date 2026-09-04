# API version and schema

Capture the requested version and Shopify's effective version response header. Introspect or consult that version's schema before rewriting a query. Classify removed fields, changed nullability, arguments, enums, deprecations, and behavior separately.

Use `compare-responses.mjs` on the same query, variables, token type, and buyer context. Do not compare unstable IDs or timings as business differences. Test release candidates only when explicitly requested and never silently promote them.

Official reference: https://shopify.dev/docs/api/usage/versioning

