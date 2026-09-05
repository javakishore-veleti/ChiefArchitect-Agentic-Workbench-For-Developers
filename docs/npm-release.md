# npm release process

AWFD uses feature, develop, release, and main branches. npm packages are published only from a semantic-version tag whose commit is reachable from `main`.

## Branch flow

1. Create `feature/*` from `develop` and merge it back through a pull request.
2. Create `release/vX.Y.Z` from `develop`.
3. Set every public workspace package to version `X.Y.Z`, update the lockfile, and run `npm run release:check`.
4. Merge the release pull request into `main`, then merge the release result back into `develop`.
5. Create the annotated tag `vX.Y.Z` on the release commit in `main` and push that tag.

The publish workflow rejects a tag made from any commit that is not in `main`. It publishes `@javakishore-veleti/awfd` first, domain packs next in stable alphabetical order, and `@javakishore-veleti/awfd-all` last.

Publication requires the root Apache License 2.0 text and `"license": "Apache-2.0"` in every public package. The release verifier rejects any mismatch.

## One-time npm setup

For every package on npmjs.com, configure a GitHub Actions trusted publisher with:

- owner: `javakishore-veleti`
- repository: `ChiefArchitect-Agentic-Workbench-For-Developers`
- workflow: `npm-publish.yml`
- GitHub environment: `npm`

Create the protected `npm` environment in GitHub before the first release. The workflow uses GitHub OIDC, requests only `contents: read` and `id-token: write`, and does not use an `NPM_TOKEN` secret.

## Release commands

```bash
git switch release/v0.1.0
npm ci
npm run release:check
git switch main
git pull --ff-only
git tag -a v0.1.0 -m "AWFD v0.1.0"
git push origin v0.1.0
```

Do not reuse a version. npm package versions are immutable; the workflow skips a package only when that exact name and version already exists.
