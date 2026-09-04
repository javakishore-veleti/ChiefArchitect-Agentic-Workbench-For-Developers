# Azure Skills Catalog

This directory contains reusable Azure engineering skills. Skills discover authorized enterprise setup dynamically; they do not store organization-specific subscription, portfolio, program, environment or application inventories.

## Recommended entrypoint

Use [`diagnose-azure`](diagnose-azure/SKILL.md) for normal investigations. It resolves the configured enterprise scope, classifies the symptom, and loads only one enhanced service pattern—or the cross-service pattern when required. The 104 leaf skills remain available as optional narrowly scoped procedures.

Enterprise topology is supplied through [`shared/config`](shared/config/). It supports arbitrary tenants, subscriptions, portfolios, programs, environments, applications and Azure resource references. Keep organization-specific configuration outside this repository and select it with `AZURE_DIAGNOSTICS_CONFIG`; optionally supply a local, HTTPS, S3 or Azure Blob override with `AZURE_DIAGNOSTICS_CONFIG_OVERRIDE_URI`.

| Recommended skill | Routes | Words | Estimated entry tokens |
|---|---:|---:|---:|
| [`diagnose-azure`](diagnose-azure/SKILL.md) | 14 | 203 | 274 |

The enhanced routes are backed by 108 distinct, qualified official GitHub issue records. These records are diagnostic precedents, not proof that a current incident is the same platform defect.

## Token model

Word counts include YAML frontmatter and the Markdown body. Token values are planning estimates using **1.35 tokens per word**; actual usage varies by model and punctuation. A normal request loads only the selected skill. The shared operating rules add approximately **151 words / 204 tokens** when read.

| Category | Available skills | Count | Words per skill | Estimated tokens per skill |
|---|---|---:|---:|---:|
| [AKS / Deployments](aks/deployments/) | `discover-deployment-inventory`<br>`validate-deployment-manifests`<br>`diagnose-rollout-failure`<br>`compare-deployment-environments`<br>`trace-image-to-deployment`<br>`audit-resource-configuration`<br>`detect-deployment-drift`<br>`plan-safe-rollout` | 8 | 114–117 | 154–158 |
| [AKS / Services](aks/services/) | `discover-service-inventory`<br>`map-services-to-workloads`<br>`diagnose-endpoint-failure`<br>`validate-selector-mapping`<br>`audit-service-exposure`<br>`compare-service-environments`<br>`trace-service-traffic`<br>`detect-orphaned-services` | 8 | 111–114 | 150–154 |
| [AKS / Ingress](aks/ingress/) | `discover-ingress-inventory`<br>`map-hosts-to-services`<br>`trace-ingress-request`<br>`diagnose-routing-failure`<br>`validate-ingress-configuration`<br>`detect-route-conflicts`<br>`audit-tls-certificates`<br>`compare-ingress-environments` | 8 | 113–116 | 153–157 |
| [AKS / Configuration](aks/configuration/) | `discover-configuration-inventory`<br>`map-configuration-to-workloads`<br>`validate-configuration-references`<br>`detect-configuration-drift`<br>`compare-configuration-environments`<br>`diagnose-missing-configuration`<br>`audit-sensitive-configuration`<br>`trace-configuration-change` | 8 | 111–114 | 150–154 |
| [AKS / Secrets](aks/secrets/) | `discover-secret-reference-inventory`<br>`map-secrets-to-workloads`<br>`validate-secret-references`<br>`detect-expiring-certificates`<br>`diagnose-secret-mount-failure`<br>`audit-secret-handling`<br>`compare-secret-references`<br>`trace-secret-rotation` | 8 | 114–117 | 154–158 |
| [AKS / Scaling](aks/scaling/) | `analyze-scaling-configuration`<br>`diagnose-pod-scaling`<br>`diagnose-cluster-scaling`<br>`validate-hpa-metrics`<br>`detect-capacity-risk`<br>`compare-scaling-environments`<br>`recommend-scaling-bounds`<br>`trace-scaling-event` | 8 | 116–116 | 157–157 |
| [AKS / Diagnostics](aks/diagnostics/) | `assess-cluster-health`<br>`diagnose-crashloop`<br>`diagnose-pending-pods`<br>`diagnose-node-failure`<br>`trace-cross-service-request`<br>`correlate-events-logs-traces`<br>`identify-noisy-neighbor`<br>`produce-incident-evidence` | 8 | 113–119 | 153–161 |
| [Key Vault](keyvault/) | `discover-keyvault-inventory`<br>`map-vault-items-to-consumers`<br>`audit-keyvault-access`<br>`detect-expiring-vault-items`<br>`diagnose-keyvault-access-failure`<br>`validate-private-endpoints`<br>`compare-keyvault-environments`<br>`trace-keyvault-change` | 8 | 114–120 | 154–162 |
| [Azure Container Registry](acr/) | `discover-registry-inventory`<br>`map-images-to-workloads`<br>`trace-image-provenance`<br>`detect-vulnerable-images`<br>`diagnose-image-pull-failure`<br>`audit-registry-access`<br>`detect-stale-images`<br>`validate-retention-policy` | 8 | 112–115 | 152–156 |
| [Azure Cache for Redis](cache/redis/) | `discover-redis-inventory`<br>`map-redis-to-consumers`<br>`analyze-cache-performance`<br>`diagnose-redis-connectivity`<br>`detect-memory-pressure`<br>`audit-ttl-policy`<br>`analyze-cache-hit-rate`<br>`trace-cache-dependency` | 8 | 115–118 | 156–160 |
| [Cosmos DB](cosmosdb/) | `discover-cosmosdb-inventory`<br>`map-containers-to-consumers`<br>`diagnose-request-throttling`<br>`analyze-partition-distribution`<br>`validate-indexing-policy`<br>`audit-data-access`<br>`compare-cosmosdb-environments`<br>`trace-cosmosdb-dependency` | 8 | 114–117 | 154–158 |
| [Microsoft Entra](auth/entra/) | `discover-entra-application-inventory`<br>`map-identities-to-workloads`<br>`audit-api-permissions`<br>`detect-expiring-credentials`<br>`diagnose-authentication-failure`<br>`diagnose-authorization-failure`<br>`trace-role-assignment`<br>`compare-identity-environments` | 8 | 114–117 | 154–158 |
| [Application Insights](monitoring/application-insights/) | `discover-application-insights-inventory`<br>`map-telemetry-to-services`<br>`trace-distributed-request`<br>`diagnose-application-failure`<br>`analyze-dependency-latency`<br>`detect-telemetry-gaps`<br>`compare-service-reliability`<br>`produce-incident-timeline` | 8 | 113–116 | 153–157 |

## Totals

| Measure | Value |
|---|---:|
| Azure leaf skills | 104 |
| Azure skills including router | 105 |
| Categories | 13 |
| All Azure `SKILL.md` words | 12082 |
| Estimated tokens if every skill were loaded | 16311 |
| Shared operating-rules words | 151 |
| Shared operating-rules estimated tokens | 204 |

Loading every skill is neither expected nor recommended. Select the narrowest applicable skill and retrieve live enterprise data only as needed.
