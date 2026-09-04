# Datadog diagnostic skills

Use `diagnose-datadog` as the single agent-harness entrypoint. It resolves arbitrary organizations, sites, environments, and services, then loads one detailed pattern on demand. Existing category folders remain compatible organization points; they are not separately advertised skills.

| Route | Covers | Evidence records |
|---|---|---:|
| Logs | intake, pipelines, indexes, retention, archives | 5 |
| Traces/APM | propagation, sampling, retention, latency | 5 |
| Metrics | types, queries, cardinality, usage | 5 |
| RUM/Synthetics | browser/mobile experience, replay, tests | 5 |
| Dashboards/Monitors | queries, alerts, downtimes, SLOs | 5 |
| Incidents | timeline, ownership, events, impact | 4 |
| AI observability | LLM/agent traces, evaluations, DASH 2026 | 5 |
| Security/Cost | SIEM, sensitive data, audit, usage | 6 |
| Cross-signal | correlate impact, change, failure, cause | routed guidance |
| **Total** | **8 primary routes plus cross-signal** | **40** |

## Context cost

The canonical `SKILL.md` is 188 words, approximately 251 tokens. Detailed pattern and evidence files are loaded only for the selected route. Token estimates use `words × 4/3` and are directional because model tokenization varies.

## 2026 feature handling

The evidence catalog includes official DASH material published June 9, 2026. Announcements describe product direction, not tenant entitlement or GA status. The skill requires a live capability check before using Bits AI additions, Agent Evals/Console, AI Guard, BYOC Log Management, Agent Builder, or autonomous actions.
