# Client pooling and timeouts

Load this pattern for pool exhaustion, command/connect timeouts, stale connections, reconnect storms, pipeline failures, or clients that do not recover.

## Triage

1. Separate pool wait, DNS, TCP connect, TLS, authentication, queueing, server execution, response read, and application deadline.
2. Record pool maximum, idle/minimum, borrow wait, validation policy, connection age, server idle timeout, keepalive, and health-check interval.
3. Align client connection lifetime below infrastructure idle limits and validate an idle connection before reuse where the client supports it.
4. Check whether an application `Promise.race`/future timeout cancels the Redis command. Redis connections preserve reply order; an abandoned in-flight command can delay later replies.
5. For pipelines, determine whether the API fails the batch atomically or exposes partial replies; do not assume successful partial results are returned.
6. Correlate timeout bursts with new connections, bandwidth, event-loop/thread saturation, garbage collection, topology refresh, failover, token refresh, and slow commands.
7. Reproduce with a bounded pool and a network fault, then compare the last known-good client version.

## Guardrails

Do not increase pool size or timeouts before locating the delayed phase. Larger pools can amplify reconnect storms and server connection pressure. Report observed facts separately from suspected cause and label regressions only when version comparison supports them.
