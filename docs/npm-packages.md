# AWFD npm packages

AWFD publishes one installer and independently selectable technology packs. Installing a package changes only `node_modules`; copying skills into a repository is a separate, explicit `awfd install` operation. No package uses `preinstall`, `install`, or `postinstall` lifecycle hooks.

## Packages

| Package | Installed capability |
|---|---|
| `@javakishore-veleti/awfd` | Safe `awfd` installer, updater, doctor, and uninstaller |
| `@javakishore-veleti/awfd-angular` | Angular diagnostics |
| `@javakishore-veleti/awfd-azure` | Azure diagnostics |
| `@javakishore-veleti/awfd-databricks` | Databricks diagnostics |
| `@javakishore-veleti/awfd-datadog` | Datadog diagnostics |
| `@javakishore-veleti/awfd-github-actions` | GitHub Actions diagnostics |
| `@javakishore-veleti/awfd-postgres` | PostgreSQL diagnostics |
| `@javakishore-veleti/awfd-redis` | Redis diagnostics |
| `@javakishore-veleti/awfd-shopify` | Shopify Admin API, Storefront API, cart, customer, discount, order, and product diagnostics |
| `@javakishore-veleti/awfd-spring-boot` | Spring Boot diagnostics |
| `@javakishore-veleti/awfd-all` | Composition package containing all nine technology packs |

Domain packages keep downloads focused. `awfd-all` depends on the same domain packages; it does not maintain a second copy of their payloads.

## Install a technology pack

```bash
npm install --save-dev @javakishore-veleti/awfd-azure
npx awfd install
```

The first command adds the package to the project. The second copies its canonical implementation and adapters into the repository. With several AWFD domain packages installed, no arguments activates all locally installed packs:

```bash
npm install --save-dev \
  @javakishore-veleti/awfd-azure \
  @javakishore-veleti/awfd-datadog
npx awfd install
```

Select one pack or selected harnesses when required:

```bash
npx awfd install azure
npx awfd install azure --harness codex,cursor,antigravity,claude,copilot
npx awfd install azure --harness codex,claude --dry-run
```

Harness aliases map to three physical catalogs:

| CLI harness | Installed catalog |
|---|---|
| `codex`, `cursor`, `antigravity` | `.agents/skills/` |
| `claude` | `.claude/skills/` |
| `copilot` | `.github/skills/` |

Adapters use portable IDs such as `awfd-azure`. The corresponding human-facing coordinate is `awfd:azure`; a routed capability may use `awfd:azure:aks`. Colons are not used in npm package names or portable skill IDs.

## Install all packs

```bash
npm install --save-dev @javakishore-veleti/awfd-all
npx awfd install --all
```

## Maintain an installation

```bash
npx awfd list
npx awfd doctor
npx awfd update azure
npx awfd uninstall azure
```

AWFD records managed paths and SHA-256 hashes in `.agentic-workbench/installation.json`. It refuses to overwrite or remove a changed file unless the developer explicitly supplies `--force`. `--dry-run` reports the plan without writing the payload or manifest. Pack payload symlinks, path traversal, unsafe repository roots, and symlinked destination ancestors are rejected.

Configuration overrides and credentials are not included in published packs. Runtime skills continue to resolve credentials from their documented environment or secret-provider mechanisms.

## Branch and release flow

Development follows this progression:

1. Create `feature/*` from `develop`.
2. Merge reviewed feature pull requests into `develop`.
3. Create `release/vX.Y.Z` from `develop` and set every publishable workspace to the same version.
4. Open the release pull request to `main`; CI builds every pack, runs tests, and inspects package contents.
5. Merge to `main`, then create the exact `vX.Y.Z` tag on that main-branch commit.
6. The tag workflow verifies that the tagged commit belongs to `main`, checks version equality, and publishes core first, domain packs next, and `awfd-all` last.
7. Merge the release result back into `develop`. Create `hotfix/*` from `main` only for urgent released defects.

Publication uses GitHub Actions OIDC trusted publishing and npm provenance. The workflow does not consume a long-lived `NPM_TOKEN`. It skips a version already present in npm, allowing a safely retried run to continue without overwriting an immutable release.

Prerelease versions derive their npm dist-tag from the first prerelease identifier: `0.0.1-beta.1` publishes under `beta`; stable versions publish under `latest`.

The npm trusted publisher must be configured for this repository and `.github/workflows/npm-publish.yml` before the first release.
