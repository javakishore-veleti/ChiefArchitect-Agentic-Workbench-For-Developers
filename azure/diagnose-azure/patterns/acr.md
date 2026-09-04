# Azure Container Registry

Use this pattern for ACR login, push, pull, repository, manifest, cache, task, geo-replication, network, authorization, or telemetry symptoms. Treat community issues as hypotheses only; prove the cause in the selected registry and time window.

## Scope first

Resolve the environment mapping, subscription, tenant, resource group, registry login server, cloud, SKU, region/replicas, network exposure, permission mode, caller identity, repository, tag or digest, and UTC failure window. Never infer an ACR from a similarly named AKS cluster. Redact tokens, credentials, tenant-specific URLs, and image contents.

## Read-only evidence

1. Capture the exact client error and correlation ID. Distinguish DNS/TCP/TLS, challenge/token exchange, authorization, manifest lookup, platform selection, throttling, and upstream cache failure.
2. Inspect registry properties: provisioning state, login server, public access, network rules, private endpoints, zone/geo replicas, policies, and role-assignment permission mode.
3. Identify the principal actually used at the data plane. Compare its effective repository scope with the requested operation; do not equate control-plane access with image pull/push access.
4. Resolve the immutable artifact chain: requested reference -> manifest digest -> media type/index -> platform child manifest. Confirm repository/tag existence without pulling content.
5. For cache or import, separate upstream authentication and availability from ACR cache-rule health. Record upstream status, ACR status, correlation ID, and whether digest and tag paths differ.
6. For tasks, collect run state, timestamps, agent-pool/network context, and diagnostic settings. Absence of task telemetry is an evidence gap, not proof of success.
7. For geo-replication, compare the push region/time with the resolving replica and digest. Do not label propagation delay until identity, reference, and network causes are excluded.

## AKS pull boundary

When the symptom is `ErrImagePull` or `ImagePullBackOff`, obtain the pod event, fully resolved image reference, node architecture, kubelet/containerd error, cluster kubelet identity, registry permission mode, private DNS/network path, and matching ACR login event. Then route to the AKS pattern for node, workload, admission, or scheduling evidence. A pod event alone cannot establish an ACR outage; a `401` may coexist with a missing tag, empty tag, or incompatible manifest.

## Conclusions

Rank findings as confirmed, supported, or unverified. For each, cite the observation, resource scope, UTC timestamp, and safe next check. Require explicit authorization before role changes, firewall changes, imports, builds, tag deletion, purge, replication changes, or task execution.

Issue-derived leads are in `../knowledge/acr-issues.jsonl`; match them by symptoms and boundaries, not title alone.
