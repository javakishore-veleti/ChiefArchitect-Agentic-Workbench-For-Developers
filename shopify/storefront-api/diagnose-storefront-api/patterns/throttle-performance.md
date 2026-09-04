# Throttling and performance

Separate network timeout, origin timeout, HTTP 429, GraphQL throttle error, and slow application rendering. Capture request ID, duration, query shape, variables, cache mode, retry count, and throttle metadata when supplied.

Reduce fields and connection sizes to find the cost driver. Retry only idempotent reads, honor `Retry-After`, add bounded jitter, and preserve the first failure. Do not create retry storms. Compare Hydrogen cache hits and misses separately from Shopify latency.

Official reference: https://shopify.dev/docs/api/usage/limits

