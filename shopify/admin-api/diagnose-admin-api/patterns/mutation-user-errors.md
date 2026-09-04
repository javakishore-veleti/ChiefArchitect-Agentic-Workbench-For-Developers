# Mutation user errors

## Match signals

- usererrors
- invalid input
- mutation failed
- partial update
- atomic

## Procedure

Inspect top-level errors and mutation userErrors; map field paths back to the submitted input.

Resolve topology using `references/environment-topology.md`. Apply `references/evidence-and-safety.md`. Load or run only these relevant artifacts:

- `scripts/summarize-graphql.mjs`
