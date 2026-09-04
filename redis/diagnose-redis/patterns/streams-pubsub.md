# Streams and Pub/Sub

Load this pattern for duplicate stream delivery, growing pending lists, stalled consumers, missing Pub/Sub messages, or list-backed worker concurrency.

## Streams

1. Capture stream, group, consumer, requested ID, batch size, blocking interval, and acknowledgement policy.
2. Use `XINFO GROUPS`, `XINFO CONSUMERS`, and bounded `XPENDING` to separate new-entry lag from pending-entry recovery.
3. In `XREADGROUP`, `>` requests entries never delivered to another consumer. An explicit ID such as `0` reads that consumer's pending history and can repeatedly return unacknowledged entries.
4. Acknowledge only after successful processing. Use `XAUTOCLAIM`/`XCLAIM` for stale ownership and an application retry/dead-letter policy for poison messages.
5. Treat `NOACK` as deliberate at-most-once behavior; it can lose messages and is not a general duplicate-prevention fix.

## Pub/Sub and lists

- Pub/Sub is transient: disconnected subscribers do not receive missed messages. Select Streams when recovery or durable consumer progress is required.
- List push/pop commands are atomic. For reliable work queues, inspect whether the design has an in-flight list or another recovery mechanism rather than assuming atomic pop provides processing guarantees.

## Relevant forum evidence

- `forum-2804`: a loop requesting ID `0` re-read an unacknowledged PEL entry; the answered topic distinguishes pending recovery from reading new entries with `>`.
- `forum-2718`: a user questioned duplicate pops among concurrent list consumers; separate command atomicity from end-to-end delivery semantics.

Official references: [XREADGROUP](https://redis.io/docs/latest/commands/xreadgroup/), [XPENDING](https://redis.io/docs/latest/commands/xpending/), [XAUTOCLAIM](https://redis.io/docs/latest/commands/xautoclaim/), [Pub/Sub delivery semantics](https://redis.io/docs/latest/develop/pubsub/).
