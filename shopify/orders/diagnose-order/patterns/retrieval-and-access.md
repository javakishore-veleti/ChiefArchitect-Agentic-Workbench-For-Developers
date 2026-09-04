# Retrieval and access

Check the resolved shop, Admin API version, token scopes and order GID. By default Shopify exposes only the last 60 days; older-order access additionally requires approved `read_all_orders`. Distinguish `null` caused by scope, protected-customer-data approval, wrong shop, invalid GID and genuine absence. Query a minimal identity/status selection before adding customer fields.

Evidence: resolved config name/environment, shop domain, token scope names, order creation time, HTTP/GraphQL error and request ID. Never emit customer contact/address data unless the task requires it.
