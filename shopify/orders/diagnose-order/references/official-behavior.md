# Official behavior checkpoints

- Order object and permissions: https://shopify.dev/docs/api/admin-graphql/latest/objects/Order
- Orders beyond 60 days require approved `read_all_orders` in addition to order access.
- Order creation: https://shopify.dev/docs/api/admin-graphql/latest/mutations/orderCreate
- Fulfillment workflows: https://shopify.dev/docs/apps/build/orders-fulfillment/order-management-apps/build-fulfillment-solutions
- Refund creation: https://shopify.dev/docs/api/admin-graphql/latest/mutations/refundCreate
- Returns: https://shopify.dev/docs/apps/build/orders-fulfillment/returns-apps
- Webhook behavior: https://shopify.dev/docs/apps/build/webhooks

Use the version selected by the resolved configuration, not an unpinned `latest` schema, when validating production behavior.
