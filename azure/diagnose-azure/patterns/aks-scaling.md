# AKS scaling

Use for HPA/KEDA, cluster autoscaler, node-pool capacity, pending workloads, scale oscillation or saturation.

## Evidence sequence

1. Resolve workload, namespace, node pool, scaler and the observation window including timezone.
2. Read replicas, HPA/KEDA status, metrics availability, requests/limits, pending-pod reasons and scaling events.
3. Read node-pool min/max/current, autoscaler profile, quotas, subnet/IP capacity, zones, taints and SKU availability.
4. Correlate demand, desired replica changes, scheduling outcomes and node lifecycle events on one timeline.
5. Compare with a healthy workload/environment after normalizing load and configured bounds.

## Decision rules

- HPA desired replicas without scheduled pods: route to capacity/scheduling, not metric tuning.
- No scale-up: check max bounds, unhelpful pod constraints, quota, SKU and subnet exhaustion.
- No scale-down: check utilization, PDBs, local storage, annotations and unmovable pods.
- Treat recommendations as simulations; include impact on cost, availability and disruption.

## Output

Return demand-to-capacity timeline, limiting constraint, ranked causes, confidence, gaps and bounded recommendations. Never scale workloads or node pools automatically.
