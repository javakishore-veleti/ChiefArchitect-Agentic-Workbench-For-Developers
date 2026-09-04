# Code eligibility

Separate “code accepted” from “discount allocated.” Check status and schedule, exact normalized code, usage limit, once-per-customer state, buyer context or segment, minimum quantity/subtotal, entitled products/collections, subscription rules, and combinations. Reproduce with the same authenticated buyer identity and cart contents. Record Storefront rejected-code messages when available. Do not infer eligibility from Admin configuration alone; evaluate the actual buyer and merchandise context without exposing customer data.

Official: https://shopify.dev/docs/api/admin-graphql/latest/objects/DiscountCodeBasic
