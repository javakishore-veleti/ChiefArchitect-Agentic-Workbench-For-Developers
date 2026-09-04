# Managed Redis services

Load `knowledge/managed-services.jsonl` only when the selected deployment is Azure Cache for Redis, Azure Managed Redis, Amazon ElastiCache, Redis Cloud, or Redis Enterprise Cloud.

## Route by control plane first

| Signal | Check before Redis internals |
|---|---|
| Cannot connect | Private endpoint/VPC routing, DNS, security policy, TLS endpoint and provider identity |
| Authentication expires | Entra or IAM token audience, TTL, refresh and connection-pool lifetime |
| Scale/failover errors | SKU/topology prerequisites, replicas, maintenance state and client reconnect behavior |
| Terraform failure | Provider version, resource schema, REST status and concurrent control-plane operations |
| Version/CVE uncertainty | Provider-published maintenance state and support attestation; displayed major version may be insufficient |

Never label these as Redis core defects without independent server evidence. Preserve `provider`, deployment identifier, environment, region, SKU, engine/version, client/version, timestamp and provider request/correlation ID. Redact endpoints, principals and credentials.

Prefer read-only evidence. Do not trigger failover, scaling, rotation or recreation merely to test a hypothesis. For identity failures, test a fresh token on a new connection before changing ACLs. For control-plane errors, separate Terraform/provider behavior from data-plane command behavior.
