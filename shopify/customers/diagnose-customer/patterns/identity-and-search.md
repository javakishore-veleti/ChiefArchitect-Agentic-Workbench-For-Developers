# Identity and search

Normalize the identifier type before querying: Shopify GID, email, phone, external ID, or legacy ID. Preserve the original input separately. Admin search syntax is not exact identity matching; record the generated search query and inspect all returned candidates.

Do not merge or create customers during diagnosis. For apparent duplicates, compare IDs, creation times, verified-email state, phone normalization, tags, and merge history. A customer absent from one shop/environment proves nothing about another.
