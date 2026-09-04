# Version, pagination and platform behavior

Pin and report the configured API version. For a regression, run the same minimal read-only query against two supported versions and compare field presence, errors and request IDs. Page through connections using `pageInfo.endCursor`; never compare a partial page to bulk output. Retry transient 429/5xx reads with bounded backoff, but preserve request IDs and stop after the configured limit.

A community report is a hypothesis. Confirm schema availability in current official documentation and isolate shop-specific behavior before calling it a platform defect.
