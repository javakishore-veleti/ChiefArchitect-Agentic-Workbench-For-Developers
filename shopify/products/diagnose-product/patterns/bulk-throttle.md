# Bulk operations and throttling

Record bulk operation ID, status, error code, object count, file size, timestamps and request IDs. Distinguish query creation, server processing, result URL download and JSONL parsing failures.

Respect cost/throttle metadata for ordinary GraphQL. For transient result-download failures, retry with bounded exponential backoff and preserve the operation ID; never launch duplicate bulk mutations automatically. Stream JSONL rather than loading large files into memory.
