# AKS services

Use for unreachable Services, missing endpoints, selector mismatches, load-balancer health, exposure or traffic-policy issues.

## Evidence sequence

1. Resolve cluster, namespace, Service, caller, protocol, port and expected backend.
2. Read Service spec/status, EndpointSlices, selected pods, readiness, NetworkPolicies and events.
3. Verify selector-to-label mapping, `port` to `targetPort`, named ports, address family and endpoint readiness.
4. For `LoadBalancer`, inspect public/private intent, assigned frontend, health-probe configuration and Azure load-balancer events without dumping credentials.
5. Test DNS and connectivity from an approved diagnostic context; distinguish DNS, connect, TLS and HTTP failures.

## Decision rules

- No EndpointSlices: prove selector mismatch or absence of ready pods before blaming networking.
- Endpoints exist but connect fails: inspect policy, CNI, kube-proxy/data plane and node reachability.
- External-only failure: compare internal reachability before routing to ingress or Azure Load Balancer.
- Treat `externalTrafficPolicy`, session affinity and dual-stack behavior as explicit hypotheses, not defaults.

## Output

Return the traffic path, broken hop, endpoint evidence, exposure risk, ranked causes and safe next checks. Never change Service type, annotations or policies automatically.
