# AKS deployments

Use for failed rollouts, unavailable replicas, image changes, probes, resources, scheduling, or environment drift.

## Evidence sequence

1. Resolve subscription, cluster, namespace, workload, container, environment, and expected revision.
2. Read Deployment/StatefulSet status, ReplicaSets, pods, conditions and namespace events. Preserve timestamps and object UIDs.
3. Compare desired versus observed image digest, replicas, probes, resources, service account, selectors and rollout strategy.
4. Inspect failing-container current and previous logs; correlate node, admission, image-pull and volume events.
5. Compare with one healthy environment only after normalizing environment-specific values.

## Decision rules

- `ProgressDeadlineExceeded`: identify the first unready ReplicaSet and earliest causal event.
- `ImagePullBackOff`: route to ACR after recording image, digest, identity and registry response.
- `FailedScheduling`: route to scaling/diagnostics; separate capacity, taint, affinity, quota and volume causes.
- `CrashLoopBackOff`: distinguish application exit, probe kill, OOM and dependency failure.
- Never call a rollout successful from Deployment status alone; require ready endpoints and a read-only health observation.

## Output

Return scope, expected/observed revision, timeline, first causal evidence, ranked causes, confidence, gaps and reversible next checks. Do not restart, scale, patch or roll back without explicit approval.
