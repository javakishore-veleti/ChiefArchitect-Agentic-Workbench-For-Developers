# SSR and hydration

Load this pattern for NG05xx errors, server/client DOM mismatches, lost event replay, incremental hydration, dynamic projection, or island-style rendering.

## Evidence to collect

- Render mode per route, hydration providers on server and client, event replay, incremental hydration, and zoneless settings.
- Server HTML and DOM immediately before bootstrap; preserve Angular annotations and whitespace.
- First divergent node/branch, not only the final error; include router-outlet nesting and deferred boundaries.
- Whether nodes were created, projected, or moved outside Angular; how each `ViewContainerRef` was obtained.
- Server and client resource/TransferState values at the first change-detection pass.

## Diagnosis

Compare server and first-client render inputs before changing templates. Classify the case as DOM mutation, unsupported projection, provider mismatch, asynchronous branch divergence, dynamic-container metadata, or requested-but-unsupported fragment hydration. `ngSkipHydration` is a scoped workaround, not proof that arbitrary projected nodes are supported.

Do not erase server DOM, disable hydration globally, or add browser-only branches as the first recommendation. Preserve event-replay implications in the result and identify the smallest boundary where server/client output diverges.

Query `knowledge/framework-components.jsonl` with `area == "ssr-hydration"`; open only matching records. Verify the applicable constraint or error against the linked angular.dev page.
