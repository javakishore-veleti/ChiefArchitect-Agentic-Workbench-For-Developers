# Timeouts and bulk operations

## Match signals

- timeout
- large query
- bulk operation
- jsonl
- long running

## Procedure

Minimize the query, isolate the expensive connection and prefer bulk operations for enterprise exports.

Resolve topology using `references/environment-topology.md`. Apply `references/evidence-and-safety.md`. Load or run only these relevant artifacts:

- `queries/start-bulk-products.graphql`
