# Components, signals, and lifecycle

Load this pattern for stale component views, unexpected effect execution, required signal inputs, dynamic views, Angular Elements boundaries, or lifecycle ordering.

## Evidence to collect

- Exact Angular, CLI, TypeScript, RxJS, and Zone.js versions; build mode and browser.
- Component change-detection strategy and whether the failing path is AOT, JIT, TestBed, or production.
- Signal producer, every template/effect/computed consumer, and the view that creates or destroys each consumer.
- Router navigation IDs and lifecycle logs keyed by component-instance ID.
- For dynamic views, record the owning `ViewContainerRef`, injector, insertion time, and any manual change detection.

## Diagnosis

Separate documented semantics from defects. Resources are eager unless the applicable API documents otherwise; a parameterized computation is not the same abstraction as a zero-argument computed signal. Reproduce signal failures with the smallest parent/child change-detection matrix. For lifecycle reports, prove constructor, initialization, activation, deactivation, and destruction ordering before attributing the behavior to Angular.

Do not recommend `detectChanges`, `markForCheck`, an effect, or a timeout until the dependency owner and scheduling boundary are known. Treat missing reproductions and feature requests as evidence, not confirmed framework defects.

Query `knowledge/framework-components.jsonl` with `area == "components-signals"`; open only matching records. Verify expected behavior against the linked angular.dev page.
