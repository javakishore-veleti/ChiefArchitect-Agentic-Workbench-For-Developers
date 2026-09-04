# Testing

Use for TestBed, component fixtures, HTTP testing, zoneless tests, Jasmine/Vitest timers, `fakeAsync`, `whenStable`, defer blocks, or flaky tests.

## Triage

- Record runner, browser/Node mode, Zone.js or zoneless mode, Angular/build versions, and whether the test passes alone but fails in the suite.
- Reduce to one fixture and identify every scheduler: promises, timers, RxJS schedulers, animations, effects and test-runner fake timers.
- Do not mix `fakeAsync` assumptions with Vitest/Jasmine fake timers without establishing clock ownership.
- In zoneless tests, prefer observable stability and awaited fixture APIs; do not assume `tick()` advances all work.
- For HTTP tests, register `provideHttpClient()` before `provideHttpClientTesting()`, assert the exact request, flush/error it, then verify no outstanding requests.
- For signal inputs, defer blocks, overrides and component imports, reproduce with native TestBed before attributing behavior to a mocking library.

## Flake isolation

Run the test repeatedly, randomized and alone. Check leaked providers, unflushed HTTP requests, pending timers, shared mutable fixtures and missing teardown. A workaround is not a confirmed framework bug; retain issue status and maintainer disposition from the evidence record.
