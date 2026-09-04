# Spring Boot diagnostic skills

`diagnose-spring-boot` is the single entry point. It routes a request to one conditional pattern instead of exposing every Spring module as a separate skill.

| Route | Scope |
|---|---|
| web-api | MVC, WebFlux, REST, serialization and CORS |
| security | Authentication, authorization, OAuth2/OIDC, JWT and CSRF |
| data-jpa | DataSource, JDBC, JPA, Hibernate and repositories |
| transactions | Boundaries, rollback, isolation, locking and deadlocks |
| configuration | Profiles, binding, beans, auto-configuration and startup |
| testing | Context, slice, MockMvc and Testcontainers failures |
| actuator-observability | Sanitized health, metrics, traces and logs |
| messaging-integration | Kafka, AMQP and Spring Integration |
| batch | Jobs, steps, readers, writers and restart behavior |
| caching | Cache abstraction, Redis, Caffeine and invalidation |
| deployment-runtime | Containers, Kubernetes, probes and resources |

The router entry point is 230 words (approximately 305 input tokens). Detailed patterns and 109 official issue records load only after routing, so unrelated module guidance does not consume the initial skill context.

Configuration models arbitrary environments and multiple applications per named config. Each application can declare profiles, endpoints, repository/module mappings, log-field mappings, and secret references. Copy the examples in `shared/config` and `shared/vocabulary`; organization-specific files may be committed when they contain no credentials or sensitive values.

Supply non-repository overrides with `SPRING_BOOT_CONFIG_OVERRIDE_URI` or `--override-uri`. Supported sources are local paths, `file://`, HTTPS, `s3://`, and `azblob://ACCOUNT/CONTAINER/BLOB`. Explicit CLI input wins over the environment variable. Named override entries replace complete base entries before validation.

The vocabulary maps business terms to a service, module, endpoint, and safe log fields. Unknown and ambiguous terms fail instead of being guessed.
