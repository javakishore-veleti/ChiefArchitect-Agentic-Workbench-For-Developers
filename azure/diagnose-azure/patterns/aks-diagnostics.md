# AKS diagnostics

Use when the symptom spans pods, nodes, control plane, CNI, storage, add-ons or several services.

## Evidence sequence

1. Fix scope and time window: subscription, cluster, namespace, workload/pod, node and correlation identifiers.
2. Capture cluster/node/pod conditions, events ordered by timestamp, current/previous logs, restarts, exit codes and resource pressure.
3. Build a timeline across deployment revision, scheduling, image pull, mounts, probes, runtime, network and dependencies.
4. Check platform/add-on health and relevant Azure resource health without collecting broad unrelated logs.
5. Route the first evidence-backed divergence to deployment, service, ingress, configuration, secrets or scaling.

## Decision rules

- `Pending`: classify scheduling, quota, volume, admission or image cause from events.
- `CrashLoopBackOff`: use last termination reason and previous logs; backoff is a symptom.
- Node `Ready` does not rule out container runtime, disk, CNI or kubelet degradation.
- Correlation requires matching timestamps and identifiers; temporal proximity alone is weak evidence.

## Output

Return normalized scope, concise timeline, first divergence, ranked hypotheses with supporting/contradicting evidence, confidence, gaps and reversible checks. Do not drain, cordon, restart or collect secrets without approval.
