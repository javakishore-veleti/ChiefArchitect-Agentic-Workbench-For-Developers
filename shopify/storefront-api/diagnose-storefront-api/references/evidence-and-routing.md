# Evidence and routing

`knowledge/community-cases.jsonl` contains paraphrased reports used only to suggest checks. A report is not proof of a platform defect. Open its source, check dates and staff replies, then verify the current behavior against official documentation and a minimal reproduction.

Keep this skill for cross-cutting transport, authentication, context, publication, version, throttling, and Hydrogen runtime failures. Route resource semantics as follows:

- carts and checkout lifecycle: `shopify/carts`
- products, variants, collections, inventory, metafields and metaobjects: `shopify/products`
- customer identity and Customer Account API: `shopify/customers`
- customer-visible orders: `shopify/orders`
- discount application and eligibility: `shopify/discounts`

Never include access tokens, cookies, buyer personal data, signed override URLs, or complete raw HTML in evidence.

