# Messaging and Integration

Use this pattern for Spring Kafka, Spring AMQP, and Spring Integration. Identify the module and exact version first; similar words such as retry, acknowledgement, transaction, error channel, and dead letter have different semantics in each module and broker.

## Evidence to collect

- Message identity, correlation/trace ID, timestamp, destination, partition or queue, and sanitized headers
- Producer send result, publisher confirms/returns, broker delivery evidence, consumer assignment and concurrency
- Listener/container type, acknowledgement mode, transaction manager, retry/backoff policy, recoverer, DLT/DLQ route
- Serializer/converter classes plus content type, type headers, payload class and exception chain
- Broker/client/framework versions and the smallest configuration excerpt that changes behavior
- For Spring Integration, channel type, endpoint/adaptor, poller, error channel, message history and shutdown lifecycle

## Diagnose by module

### Spring Kafka

Reconstruct one record's lifecycle: production, broker offset, assignment, delivery, listener outcome, retry topic or seek, recovery/DLT, and final committed offset. For batch listeners, preserve partition and failed index; preceding records have special commit semantics. Do not infer exactly-once behavior from an idempotent producer alone—verify container and Kafka transaction boundaries. For async or suspend listeners, check whether in-flight work, commits, retries and shutdown share the assumed lifecycle.

### Spring AMQP

Separate application retry, broker redelivery, dead-letter exchange routing, publisher confirms and returned messages. Record queue type and broker version because quorum delivery limits can change observed counters. Validate converter selection using actual content-type/encoding and type headers. Treat recoverer headers as bounded data; large exception traces can exceed broker frame constraints.

### Spring Integration

Trace the `Message` through named channels and endpoints. Distinguish synchronous exception propagation from `ErrorMessage` publication. For pollable/reactive channels, inspect receive and stop races. Lifecycle-only headers such as closeable resources must not cross serialization boundaries. For metadata stores, gather database locking and atomicity evidence rather than categorizing the failure as generic message loss.

## Safe conclusion

Report observed delivery, side effects and acknowledgement/commit separately. State whether the case is duplication, delay, routing failure, conversion failure, or confirmed loss. Read matching records in `../knowledge/messaging-batch.jsonl`; evidence levels marked `reported`, `invalid`, or `investigation` are not confirmed framework defects.
