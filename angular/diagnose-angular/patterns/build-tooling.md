# Build and tooling

Use for Angular CLI, application-builder migration, esbuild/Vite development behavior, workspaces, library builds, source maps, budgets, cache, coverage or CI-only failures.

## Capture first

- `ng version`, Node and package-manager versions; lockfile and package-manager choice.
- Workspace project, target, builder, named configuration and exact command.
- Relevant `angular.json`, `tsconfig*`, package overrides and CI environment—sanitized.
- Clean-install result and output-path/artifact differences.

## Diagnose

1. Confirm the installed CLI/build/framework majors are compatible; distinguish global/temporary CLI from workspace CLI.
2. Resolve the effective target configuration, including configuration overlays, before claiming an option was ignored.
3. After application-builder migration, check `dist/<project>/browser`, SSR outputs, stylesheet/script resolution and removed webpack-only assumptions.
4. Separate development-server transformations from production build output. Vite behavior under `ng serve` does not prove the production artifact is affected.
5. In monorepos, qualify the project and secondary entry point; verify paths relative to workspace root, project root and `sourceRoot`.
6. For dependency security reports, record the resolved dependency/version and advisory, then verify the Angular patch/release rather than recommending arbitrary nested overrides.

Return reproduction scope, responsible package/layer, regression boundary when known, safe workaround, and the version/configuration that should be retested.

