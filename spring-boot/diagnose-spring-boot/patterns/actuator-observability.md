# Actuator and observability

Load this pattern for health, availability, metrics, observations, tracing, or logging.

## Evidence to collect

- Spring Boot, Micrometer, tracing bridge, registry/exporter, and JDK versions
- management port/base path, endpoint exposure, health groups, and additional paths
- raw liveness/readiness responses with timestamps and Kubernetes probe results
- meter/observation name, tags, cardinality, sampling, trace/span IDs, and exporter errors
- lifecycle events and custom `HealthContributor` timings

## Decision rules

1. Distinguish application `LivenessState` and `ReadinessState` from the aggregate health-group result. A custom dependency health indicator does not redefine the lifecycle event timeline.
2. Test endpoint reachability, endpoint authorization, contributor status, and response mapping separately.
3. Missing telemetry can occur at instrumentation, context propagation, sampling, registry, export, or backend ingestion. Identify the first missing stage.
4. Preserve observation-scope nesting. A manually installed span on a thread with an active observation is not equivalent to creating a child observation.
5. Diagnose metrics by meter identity and tags before inspecting dashboard queries. Flag unbounded high-cardinality values.
6. Treat structured-log formatting, transport, parsing, indexing, and correlation as separate stages; redact secrets and regulated data.

Use read-only actuator endpoints by default. Do not expose `env`, `configprops`, heap dumps, loggers, or custom write operations merely to troubleshoot. Load `knowledge/observability-runtime.jsonl` only when a matching symptom needs precedent.
