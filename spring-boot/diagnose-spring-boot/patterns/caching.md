# Spring cache abstraction and Redis-backed caches

Use for `@Cacheable`, `@CachePut`, `@CacheEvict`, cache keys, stale/missing values, reactive return types, stampedes, serialization, Redis TTL, or cross-environment cache behavior.

## Resolve cache identity

Record application/environment, cache manager/provider, cache name, computed key, key prefix, serializer, TTL, null-value policy, method proxy path, and deployment/version. Never inspect a production value unless the diagnostic plan explicitly permits it.

## Diagnose

- Confirm proxy interception; self-invocation does not trigger cache annotations.
- Recompute the key from the real runtime arguments and parameter-name metadata. Treat a null key as configuration failure, not a cache miss.
- Separate cache lookup errors from business-method errors and confirm the configured `CacheErrorHandler` path.
- For stale data, place database commit, cache put/evict, event publication, replicas, and concurrent requests on one timeline.
- `allEntries=true` eviction may race with new inserts; prove ordering before changing `beforeInvocation`.
- For reactive values, confirm whether the provider stores the produced value or publisher and how cancellation/errors are handled for that framework version.
- For Redis, compare prefix, database, serializer, TTL/PTTL, key type, and configured cache manager. Do not use `KEYS`, `MONITOR`, broad `SCAN`, or mutation commands as routine diagnostics.

## Return

Report cache identity without exposing sensitive key material, hit/miss/error path, origin call, mutation/eviction ordering, TTL evidence, likely boundary, confidence, and a bounded verification step. Do not present invalid, declined, or still-open community reports as confirmed defects.

