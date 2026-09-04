# Testing diagnostics

Use this pattern for `@SpringBootTest`, test slices, mock/override beans, context caching, Testcontainers, `@ServiceConnection`, AOT and native tests. Load `knowledge/config-testing.jsonl` only after routing to testing.

## Diagnose the test boundary

1. Record Boot, Framework, JUnit, Testcontainers, build-plugin, Java and GraalVM versions.
2. Identify the test bootstrap annotation and imported configuration. Compare its auto-configurations with a full application context.
3. For slices, confirm whether an embedded database replaced the configured datasource and whether the required component lies outside the slice boundary.
4. For test doubles, distinguish bean-name replacement, candidate selection with `@Primary`, and framework test override annotations such as `@MockitoBean`; capture context-cache effects.
5. For context reuse, compare merged context configuration, profiles, dynamic properties, customizers and container declarations across test classes.
6. For Testcontainers, capture declaration style, lifecycle owner, image, exposed service, `ConnectionDetails` type and the consumer auto-configuration.
7. Run the smallest failure on the JVM before native/AOT comparison. Inspect generated AOT sources and runtime hints; a passing JVM test is not evidence that `nativeTest` is valid.
8. Preserve the first context startup exception. Later parameter-resolution or teardown failures are often secondary.

## Evidence rules

- Do not turn a closed invalid, duplicate, declined or external-project report into a confirmed Boot defect.
- Do not replace a slice with `@SpringBootTest` before identifying what the slice intentionally excludes.
- Do not add `@DirtiesContext` merely to mask differing configuration; first explain why cache keys differ.
- A running container does not prove that JDBC, R2DBC, messaging or another expected connection-details factory was selected.

Return the bootstrap boundary, first failing phase, context-cache or connection-details evidence, JVM/native delta, selected precedent and minimal reproducer.

Official checkpoints: [Testing Spring Boot applications](https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html), [Testcontainers](https://docs.spring.io/spring-boot/reference/testing/testcontainers.html), and [Context caching](https://docs.spring.io/spring-framework/reference/testing/testcontext-framework/ctx-management/caching.html).
