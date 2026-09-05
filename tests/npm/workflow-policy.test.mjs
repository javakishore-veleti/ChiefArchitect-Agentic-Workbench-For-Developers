import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("CI validates integration branches and pull requests", async () => {
  const workflow = await read(".github/workflows/npm-ci.yml");
  for (const branch of ["main", "develop", "feature/**", "release/**", "hotfix/**"]) {
    assert.match(workflow, new RegExp(branch.replaceAll("*", "\\*")), `CI should cover ${branch}`);
  }
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /npm run release:check/);
});

test("publishing is tag-only, main-ancestry guarded, and OIDC-based", async () => {
  const workflow = await read(".github/workflows/npm-publish.yml");
  assert.match(workflow, /tags:\s*[\s\S]*v\[0-9\]+\\\.\[0-9\]+\\\.\[0-9\]+|tags:\s*[\s\S]*v\*/);
  assert.doesNotMatch(workflow, /branches:\s*[\s\S]*develop/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /origin\/main/);
  assert.match(workflow, /verify-package-versions\.mjs/);
  assert.match(workflow, /publish-packages\.mjs/);
  assert.doesNotMatch(workflow, /NPM_TOKEN|NODE_AUTH_TOKEN|secrets\./);
});
