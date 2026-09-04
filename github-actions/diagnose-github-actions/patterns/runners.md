# Runners

Record hosted image, runner application version, labels/group, architecture, container image, queue time, assignment, connectivity, disk/memory, clock, and `_diag` logs. For self-hosted fleets, check autoscaling and ephemeral lifecycle, update policy, outbound endpoints, orphaned jobs, workspace isolation, and label/routing drift.

Prefer ephemeral isolated runners and just-in-time registration for autoscaling. Do not expose registration tokens or inspect unrelated host data. A green step followed by runner loss can still indicate infrastructure failure; correlate runner and service timestamps.
