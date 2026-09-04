# Throttling, abuse protection, and versions

Record status, request ID, API version, endpoint, latency, response body, retry headers, and traffic shape. Separate Storefront GraphQL errors from Ajax 403/429 bot protection and carrier-service fan-out. Retry only idempotent reads with bounded backoff; do not automatically replay cart mutations. Compare schema behavior on supported versions using the same shop/context and inspect deprecations before attributing a regression.

