# Webhooks and consistency

Verify HMAC against the raw body before parsing. Record topic, shop, webhook ID, event time and receipt time. Delivery is at-least-once: deduplicate by webhook ID, tolerate retries, and reconcile by fetching the current order because topics can arrive out of order. Do not assume an absent delivery means an absent state change; check subscription, filters, API version and delivery logs.

Use `scripts/analyze-webhook-log.mjs` on redacted JSONL metadata. Never store payload secrets or protected customer data in diagnostic output.
