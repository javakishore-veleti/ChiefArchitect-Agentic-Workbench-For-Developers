# Routing and navigation

Load this pattern for navigation cancellation, redirects, guards, resolvers, lazy routes, SSR routing, stale outlets, or URL-tree construction.

## Evidence to collect

- Angular, router, SSR and browser versions; rendering mode; requested and final URLs.
- Route configuration after lazy loading, including `path`, `pathMatch`, outlets, redirects, guards, resolvers and providers.
- Ordered router events from `NavigationStart` through terminal event, with cancellation/error code.
- Guard/resolver return values and completion/error timing. Redact tokens and resolved business data.
- `ActivatedRouteSnapshot` tree, parameters and the exact commands/options passed to navigation.
- For federation or multiple apps, router owner, base href and shared-package singleton configuration.

## Decision rules

1. A URL change without a rendered component is not enough to call a router defect. Find the terminal router event and outlet activation.
2. Preloading downloads lazy code; it does not activate the route or run resolvers (`angular/angular#57753`).
3. Guards and resolvers are activation barriers. A slow child resolver can delay parent construction (`#58157`); move noncritical/live loading out of the resolver.
4. Resolver Observables provide activation data, not a continuing component-input stream (`#69481`).
5. Compare SSR/prerender and client navigation separately. Server redirects have HTTP semantics and may expose different behavior (`#60957`).
6. For relative navigation, retain the exact command array. Parent traversal is interpreted from the first command, and an absolute first command defeats `relativeTo` (`#65657`).
7. `loadComponent` with `loadChildren` can form a valid lazy parent/child shape; inspect the recognized tree (`#66257`).
8. A report labeled `needs reproduction` is a hypothesis, not a confirmed Angular defect (`#64128`).

## Outcome

Return the failing navigation phase, observed evidence, framework-versus-application attribution, smallest safe correction, and a reproduction/test plan. Never bypass an authorization guard merely to make navigation pass.
