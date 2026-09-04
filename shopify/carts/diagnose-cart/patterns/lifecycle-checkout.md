# Lifecycle and checkout

Preserve the complete cart ID including its key; redact it in reports. Compare IDs, `createdAt`, and `updatedAt` to detect recreation, stale cookies, or post-order state. `checkoutUrl` is generated for the current cart, but checkout can recalculate shipping, tax, discounts, and availability. Never assume a customer API can enumerate all carts; retain cart identity in the application session.

