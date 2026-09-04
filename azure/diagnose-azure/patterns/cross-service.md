# Cross-service diagnosis

Use when the failure crosses two or more Azure services. Build a bounded dependency path from configured `resource-refs`; do not enumerate every subscription.

Correlate in this order when applicable:

- workload identity → Entra authorization → Key Vault access;
- AKS workload → deployment image digest → ACR pull events;
- request/correlation ID → Application Insights operation → AKS pod/deployment;
- application dependency → Redis or Cosmos DB response, throttling, and latency.

Keep timestamps in UTC and distinguish causation from temporal coincidence. A shared timestamp alone is not proof. Report each hop as observed, inferred, or unavailable, and stop when the next probe would expose secrets, regulated data, or exceed the resolved scope.
