# Web and API diagnostics

Use this pattern for Spring MVC or WebFlux request mapping, binding, validation, serialization, response writing, CORS, and exception handling. Load `knowledge/web-security.jsonl` only when a community precedent would change the diagnosis.

## Establish the request path

1. Record Spring Boot, Framework, Java, servlet-container or reactive-server, and Jackson versions from the build and dependency report.
2. Identify MVC versus WebFlux from dependencies and configuration; do not infer it from controller annotations.
3. Resolve the selected handler, HTTP method, path variables, query/form parameters, `Content-Type`, `Accept`, locale, and body shape.
4. Trace application filters, security filters, interceptors, argument resolvers, conversion, validation, controller advice, message converters/codecs, and response commitment in that order.
5. Compare a failing request with one controlled request, changing one dimension at a time.

## Symptom routing

- **400/415 before the controller:** inspect routing predicates, consumes/produces, decoding, constructor/property binding, conversion, and validation.
- **Unexpected validation exception:** determine whether Bean Validation, MVC/WebFlux handler-method validation, or proxied method validation owns it.
- **Problem Details lacks field messages:** standard Problem Details does not imply disclosure of constraint details; inspect application advice and error policy.
- **Wrong JSON or slice-test-only failure:** compare full-context mapper modules/components against `@WebMvcTest` or `@WebFluxTest` imports.
- **Streaming failure or broken pipe:** record response-committed state and async dispatch; do not rewrite an already committed response.
- **CORS:** distinguish browser preflight from the actual request. Record Origin, requested method/headers, credentials mode, proxy response headers, MVC/WebFlux CORS mappings, and Security CORS integration.
- **WebFlux memory/blocking report:** retain allocation or BlockHound evidence and verify whether the owner is Spring, Reactor Netty, Jackson, or application code.

## Evidence output

Return selected handler and stack, first failing stage, observed exception/status, configuration evidence, version-sensitive precedent, and the smallest reproducible request. Label issue reports closed as invalid, duplicate, declined, or external as diagnostic leads—not confirmed Spring defects.

Official checkpoints: [Spring MVC](https://docs.spring.io/spring-framework/reference/web/webmvc.html), [WebFlux](https://docs.spring.io/spring-framework/reference/web/webflux.html), [MVC validation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html), and [CORS](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html).
