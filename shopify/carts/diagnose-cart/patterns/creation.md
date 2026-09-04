# Creation

Check the shop/API version, full cart GID, `cartCreate.cart`, `userErrors`, and `warnings`. Validate every merchandise ID is a `ProductVariant` published to the active sales channel. Concurrent creation on an empty client session can produce two carts; serialize initialization and persist one returned ID. A null cart with no top-level GraphQL error is not success.

