# HTTP and authentication

Use this pattern for `HttpClient`, `httpResource`, interceptors, credentials, token attachment, SSR transfer cache, or a browser-reported CORS failure.

## Evidence to capture

- Angular, CLI, browser, SSR/client context, request URL and initiator.
- One failing request as a sanitized HAR/cURL equivalent: method, origin, status, redirect chain, request headers and response headers.
- Provider order (`provideHttpClient`, `withInterceptors`, `withInterceptorsFromDi`, `withFetch`) and interceptor registration scope.
- Network-request count separately from interceptor/log/error-handler count.
- For SSR, whether transfer cache satisfied the request before dispatch.

## Decision points

1. If no request appears in the browser network panel, inspect subscription/lifecycle, transfer cache, service worker, and interceptor/provider wiring.
2. If one request produces repeated UI effects, prove whether retry, multiple subscriptions, or repeated error handling—not duplicate transport—is responsible.
3. For 401/403, compare the token audience, issuer, expiry, scopes/roles and effective API origin. Never print the token.
4. Treat status `0`, a blocked preflight, or “CORS” in the console as a browser symptom. Check DNS/TLS/network reachability, redirect behavior, `OPTIONS`, `Access-Control-Allow-*`, credential mode, and the API/gateway policy. Angular cannot grant cross-origin permission.
5. With SSR, compare server and browser requests; do not assume browser storage, cookies, or relative URLs behave identically on the server.

## Output

State the observed transport count, responsible layer (Angular, application/RxJS, browser, identity provider, API/gateway, or unresolved), evidence, and smallest discriminating next check. Do not label a report an Angular defect merely because it was filed in Angular's tracker.

