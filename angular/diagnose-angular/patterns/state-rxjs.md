# Signals, RxJS and state libraries

Load this pattern for stale signals, missed or duplicate emissions, `toSignal`/`toObservable`, `rxResource`, subscription cleanup, NgRx SignalStore, or federation state.

## Establish ownership first

| Surface | Owner | Diagnostic contract |
|---|---|---|
| Signals, `toSignal`, `toObservable`, Resource/rxResource | Angular framework | Verify installed Angular API and equality/lifecycle semantics. |
| Observable operators and schedulers | RxJS library | Reproduce without Angular before attributing operator behavior. |
| Store, Effects, SignalStore | NgRx library | Verify NgRx/Angular compatibility and whether an RFC shipped. |
| Federated singleton state | Bundler/federation plus DI | Verify shared package instances and injector boundaries. |

## Decision rules

1. Decide whether the value is **state** or an **event**. A signal represents current state; equal consecutive Observable values need not retrigger signal consumers (`angular/angular#61799`). Keep event semantics in RxJS.
2. Map every bridge: producer, equality, scheduler, subscription owner, destruction owner, error path and initial value.
3. When a signal drives async work, make cancellation explicit with `switchMap`, Resource cancellation, or an equivalent documented primitive. Do not assume proposed helpers exist (`#57946`).
4. If `rxResource` reports cleanup failure, preserve the original stream-factory exception and record the Angular patch version (`#63341`).
5. Signal-native router guards are proposals unless documented for the installed release; adapt to supported Promise/Observable guard results (`#65130`).
6. Leading/trailing debounce or throttle behavior remains distinct. Use the RxJS operator whose contract matches the requirement (`#68802`).
7. NgRx RFCs describe library evolution, not Angular framework defects (`ngrx/platform#4846`, `#5126`). Check release notes/types before recommending an API.
8. For micro-frontends, duplicate NgRx packages or injectors can create distinct stores. Confirm federation singleton and provider scope before blaming SignalStore (`#4552`).

## Outcome

Return a timeline of writes/emissions, the responsible framework or library, evidence status, lifecycle/cancellation finding, and the smallest testable correction. Do not recommend manual subscriptions without an explicit teardown owner.
