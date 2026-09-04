# AKS ingress

Use for host/path routing, Gateway API, ingress controller, TLS, DNS, redirects, gRPC or admission failures.

## Evidence sequence

1. Resolve hostname, path, protocol, controller/GatewayClass, namespace and intended backend.
2. Read Ingress/HTTPRoute/Gateway status, controller events, listeners, rules, ReferenceGrants, Services and EndpointSlices.
3. Resolve DNS and certificate chain; record issuer, SAN match and expiry without exposing private material.
4. Trace request layers: DNS → Azure frontend → controller/gateway → route → Service → endpoint.
5. Compare controller version and effective generated configuration with a healthy route; redact headers and tokens.

## Decision rules

- `404` from controller: prioritize host/path/class/rule matching; backend failure usually produces a different signal.
- `502/503`: verify endpoint readiness, upstream protocol/port and network policy.
- TLS failure: separate DNS/SNI, certificate selection, trust, expiry and passthrough/termination mode.
- gRPC failure: verify HTTP/2 and timeout behavior end to end.
- Admission rejection is configuration evidence; do not bypass the webhook.

## Output

Return resolved route, per-hop observations, first divergence, confidence, evidence gaps and reversible next checks. Never modify DNS, certificates or routing automatically.
