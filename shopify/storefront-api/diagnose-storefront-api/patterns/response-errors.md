# Transport and GraphQL response errors

Inspect status, `content-type`, request ID, raw body length, GraphQL `errors`, partial `data`, and extensions. HTML with HTTP 200 is a transport/platform response, not valid GraphQL JSON. Preserve a short redacted prefix only.

Classify parse errors, validation errors, access errors, internal errors, partial data, and warnings independently. A non-null `data` object does not erase errors. Redact tokens, cookies, customer identifiers, and signed URLs before sharing evidence.

Official reference: https://shopify.dev/docs/api/storefront/latest

