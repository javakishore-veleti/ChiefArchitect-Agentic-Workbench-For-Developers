# Query cost and throttling

## Match signals

- throttled
- 429
- query cost
- restore rate
- bucket

## Procedure

Capture requested and actual cost plus throttle status; reduce connections or use bulk operations.

Resolve topology using `references/environment-topology.md`. Apply `references/evidence-and-safety.md`. Load or run only these relevant artifacts:

- `scripts/run-admin-graphql.mjs`
