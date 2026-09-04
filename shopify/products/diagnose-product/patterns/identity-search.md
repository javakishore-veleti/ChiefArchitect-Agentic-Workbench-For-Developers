# Identity and search

Check the target shop and API version, then query separately by GID, handle and exact SKU. A product GID is not portable across shops. SKU is variant data and need not be unique.

Capture the submitted search string, parsed query behavior, pagination cursor and returned product/variant IDs. Escape search syntax; distinguish `null` node, empty connection and access-denied field. If environments differ, compare stable handles and variant option tuples, not result order.

Do not "fix" ambiguity by selecting the first SKU match. Report duplicates and require a stronger business key.
