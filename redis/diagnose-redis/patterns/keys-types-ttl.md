# Keys, data types, and expiration

Load this pattern for missing or duplicate keys, `WRONGTYPE`, memory-heavy structures, JSON identity, or unexpected TTL behavior.

## Safe investigation

1. Resolve the configured environment and logical cache before inspecting a key.
2. Prefer an exact key. If discovery is authorized, use bounded `SCAN` with a narrow `MATCH`; never use `KEYS *` in production.
3. Collect `EXISTS`, `TYPE`, `PTTL`, and `MEMORY USAGE`. Choose the read command only after `TYPE` is known.
4. For hashes/JSON, inspect only required fields or paths. For lists, sets, sorted sets, and streams, use bounded ranges.
5. Distinguish `PTTL = -2` (missing) from `PTTL = -1` (present without expiry).
6. Check whether a write replaced the key and removed its TTL. Do not infer expiration from an application timestamp.

## Relevant forum evidence

- `forum-2791`: estimate sorted-set cardinality and memory before changing the data model.
- `forum-2724`: when a business identifier is unique, deterministic keys plus atomic conditional writes can avoid search-then-write races.
- `forum-2720`: Redis key TTL and a downstream database TTL index are separate mechanisms; verify downstream field types.
- `forum-2718`: list pop operations are atomic, but delivery/retry semantics still belong to the consumer design.

## Report

Return resolved context, exact key (redacted if sensitive), observed type/TTL/size, expected contract, evidence, and the smallest safe next probe. Label unanswered forum reports as observations, not established fixes.

Official references: [keyspace](https://redis.io/docs/latest/develop/use/keyspace/), [EXPIRE](https://redis.io/docs/latest/commands/expire/), [data types](https://redis.io/docs/latest/develop/data-types/).
