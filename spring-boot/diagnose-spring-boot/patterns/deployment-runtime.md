# Deployment and runtime

Load this pattern for container/Kubernetes lifecycle, graceful shutdown, startup, classpath, AOT, or native-image failures.

## Runtime fingerprint

Capture the Boot and Framework versions, JDK distribution/version, JVM versus native mode, build plugin and GraalVM version, embedded server, image digest, command/entrypoint, active profiles, resource limits, probe definitions, and termination grace period. Compare the effective packaged artifact—not only source configuration.

## Triage

1. Reconstruct startup or termination as a timestamped sequence: platform event, probe transition, Spring availability event, web-server action, application work drainage, process exit.
2. Readiness removal, HTTP graceful shutdown, async executors, message consumers, and long-lived SSE/WebSocket streams have different completion conditions. Never infer one from another.
3. For CrashLoop or probe failure, distinguish process startup, management-port binding, path/port mismatch, timeout, authorization, and dependency health.
4. For classpath failures, record the dependency tree, layered-jar contents, duplicate classes, classloader, and the first causal exception.
5. For native/AOT failures, reproduce on the JVM, then with AOT, then native. Inspect generated sources/hints and identify reflection, resources, proxies, serialization, JNI, or build-option ownership.
6. Treat Docker, Kubernetes, buildpack, GraalVM, cloud registry, service mesh, and managed-platform incidents as platform-specific unless evidence demonstrates a Spring defect.

Do not recommend longer probe or termination timeouts until the blocked phase is known. Do not add broad reflection configuration when a narrow runtime hint suffices. Load `knowledge/observability-runtime.jsonl` only for a related precedent.
