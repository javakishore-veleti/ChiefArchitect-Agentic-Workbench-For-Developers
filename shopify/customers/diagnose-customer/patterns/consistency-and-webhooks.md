# Consistency and webhooks

For stale or divergent customer state, build a timeline from mutation response, request ID, webhook topic/event ID, delivery attempts, and read-after-write observations. Deduplicate webhooks by event ID and make consumers idempotent.

Confirm the event and query refer to the same shop domain, environment mapping, customer GID, and API version. Deleted, merged, redacted, and recreated customers require different handling; never silently relink records using email alone.
