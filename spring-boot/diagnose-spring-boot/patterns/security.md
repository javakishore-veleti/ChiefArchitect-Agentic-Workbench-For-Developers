# Security diagnostics

Use this pattern for SecurityFilterChain selection, OAuth2/OIDC, JWT resource servers, CSRF, sessions, request authorization, and method authorization. Diagnose configuration and runtime evidence; never request or print credentials, tokens, cookies, authorization codes, private keys, or session contents.

## Resolve the effective chain

1. Inventory every `SecurityFilterChain`/`SecurityWebFilterChain`, `@Order`, security matcher, and source configuration.
2. Match the failing request exactly. In servlet security, the first matching chain is selected; `requestMatchers` inside it authorize rather than select the chain.
3. Inspect the installed version's filter order from trace logs or a sanitized chain listing. Do not assume an order proposed in an open issue.
4. Record authentication type, anonymous state, principal class, authorities, authorization decision, entry point/access-denied handler, status, and `WWW-Authenticate`—without values.

## Authentication and authorization branches

- **JWT/resource server:** verify issuer equality, discovery/JWK endpoint reachability, clock skew, algorithm, `iss`/`aud`, key id and rotation. Check whether a decoder is accidentally created per request before blaming JWK caching.
- **OIDC login/logout:** separate browser logout, RP-initiated logout, and front/back-channel logout; record servlet versus reactive stack and the exact endpoint matcher.
- **CSRF:** identify session/cookie authentication versus bearer-only API behavior. Verify the selected chain, request method, token repository/handler, ignore matcher, and filter order. Disabling CSRF in a non-selected chain changes nothing.
- **Sessions:** record creation policy, repository/provider, cookie attributes, node affinity, serialization version and expiry metadata; do not dump session attributes.
- **Method security:** inspect `@EnableMethodSecurity`, proxy boundary, invoked method signature, composed annotations, `@PreAuthorize`/`@PostAuthorize`, and returned-object authorization separately from HTTP rules.
- **CORS plus Security:** ensure preflight can reach CORS handling before authentication; compare Framework and Security configuration rather than adding duplicate headers.

## Evidence output

Return selected chain, relevant matcher, sanitized filter order, authentication result, request- and method-authorization decisions, first denial/exception, and configuration source. Preserve the upstream issue status: question/invalid/duplicate reports are useful precedents but not confirmed bugs.

Official checkpoints: [architecture and filters](https://docs.spring.io/spring-security/reference/servlet/architecture.html), [multiple chains](https://docs.spring.io/spring-security/reference/servlet/configuration/java.html#_multiple_httpsecurity_instances), [JWT resource server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html), [CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html), and [method security](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html).
