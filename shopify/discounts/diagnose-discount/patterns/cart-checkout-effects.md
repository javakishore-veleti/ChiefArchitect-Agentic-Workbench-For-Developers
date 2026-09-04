# Cart and checkout effects

This pattern owns discount interpretation, not cart state. Capture cart ID redacted, buyer identity state, merchandise and selling plans, cost, discount codes with applicability, allocations, delivery context, and checkout observation from the same request sequence. A code can be recorded but not applicable. Compare Storefront response with the Admin discount definition and Function trace. Route stale cart IDs, session persistence, line mutations, or UI refresh failures to the cart skill.

Official: https://shopify.dev/docs/api/storefront/latest/objects/Cart
