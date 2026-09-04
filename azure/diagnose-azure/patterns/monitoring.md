# Azure Monitor and Application Insights

Use this pattern when telemetry is missing, incomplete, mis-correlated, unexpectedly expensive, or different between environments.

## Establish scope

Resolve the environment, application, Application Insights component, linked Log Analytics workspace, subscription, resource group, time range, deployment version, and expected `cloud_RoleName`. Never infer an environment from a resource-name fragment. Compare matching applications and time windows only.

## Read-only evidence sequence

1. Confirm instrumentation mode and versions: classic SDK, Azure Monitor OpenTelemetry distro/exporter, browser SDK, agent, or mixed. Record sampling and telemetry-processor settings without returning connection strings.
2. Check ingestion before application correctness: component/workspace linkage, diagnostic settings, daily cap, retention, ingestion latency, SDK self-diagnostics, and network reachability to the configured ingestion endpoint.
3. Query the narrowest identifiers first: `operation_Id`, `operation_ParentId`, trace/span ID, role, instance, result code, deployment and correlation ID. Widen time or scope only when the narrow query is empty.
4. Reconstruct a request from `requests`, `dependencies`, `exceptions`, `traces`, `pageViews`, and `customEvents`. A missing child span is not proof that the dependency did not execute; test instrumentation, propagation and sampling first.
5. For browser gaps, compare XHR with fetch, production bundle with development, route changes with page views, and `traceparent` propagation. Do not collect request/response bodies or sensitive headers.
6. For cost or volume, summarize `_BilledSize`, item counts, sampling `itemCount`, table, role and noisy dimensions. Recommend a configuration change only after preserving the signals required by SLOs, audits and incident response.

## KQL guardrails

Run read-only tabular queries only. Bound every query with `timestamp between (...)` or `ago(...)`; filter tenant/workspace, role and operation before `join` or `union`; project only needed columns; cap exploratory output. Avoid `externaldata`, cross-cluster queries, broad `search *`, unbounded joins, secret-bearing custom dimensions, and management commands.

Starter correlation query (adapt table names for workspace-based schemas):

```kusto
let start = ago(30m);
let op = "<operation-id>";
union isfuzzy=true requests, dependencies, exceptions, traces
| where timestamp >= start and operation_Id == op
| project timestamp, itemType, operation_Id, operation_ParentId,
          cloud_RoleName, name, success, resultCode, duration
| order by timestamp asc
| take 500
```

If no operation ID is available, first find candidate failed requests with a bounded role/name filter, then rerun correlation using the selected ID.

## Interpret evidence

Classify the outcome as ingestion/configuration, instrumentation, propagation/correlation, sampling/filtering, application failure, platform dependency, or insufficient evidence. Cite observed rows and configuration metadata separately from hypotheses. Use [monitoring evidence](../knowledge/monitoring.jsonl) as investigation checkpoints, not proof that the current system has the same defect.

## Return

Report resolved scope, sanitized query, observations, missing expected signals, ranked hypotheses with evidence for and against, confidence, and the next smallest read-only probe. Any alert, sampling, diagnostic-setting, retention, dashboard, or application change requires separate authorization.
