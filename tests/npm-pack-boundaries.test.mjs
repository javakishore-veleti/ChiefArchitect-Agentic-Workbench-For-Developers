import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packRoot = path.join(root, "packages", "packs");
const domains = ["angular", "azure", "databricks", "datadog", "github-actions", "postgres", "redis", "shopify", "spring-boot"];

execFileSync(process.execPath, [path.join(root, "scripts", "build-packs.mjs")], { cwd: root });

test("each domain pack contains only its domain and harness adapters", async () => {
  for (const domain of domains) {
    const manifest = JSON.parse(await readFile(path.join(packRoot, domain, "awfd-pack.json"), "utf8"));
    assert.equal(manifest.domain, domain);
    assert(manifest.files.some((file) => file.startsWith(`${domain}/`)), `${domain} canonical payload missing`);
    for (const other of domains.filter((item) => item !== domain)) {
      assert(!manifest.files.some((file) => file.startsWith(`${other}/`)), `${domain} leaked ${other}`);
    }
    for (const skill of manifest.skills) {
      for (const harness of [".agents/skills", ".claude/skills", ".github/skills"]) {
        assert(manifest.files.includes(`${harness}/${skill.id}/SKILL.md`), `${domain} missing ${harness}/${skill.id}`);
      }
    }
  }
});

test("all pack composes every domain without duplicating payload", async () => {
  const manifest = JSON.parse(await readFile(path.join(packRoot, "all", "awfd-pack.json"), "utf8"));
  assert.deepEqual(manifest.composition, domains.map((domain) => `@javakishore-veleti/awfd-${domain}`));
  const children = await readdir(path.join(packRoot, "all"));
  assert(!children.includes("dist"));
});

test("packs use the repository Apache-2.0 license", async () => {
  for (const domain of [...domains, "all"]) {
    const packageJson = JSON.parse(await readFile(path.join(packRoot, domain, "package.json"), "utf8"));
    assert.equal(packageJson.license, "Apache-2.0", `${domain} must match the repository license`);
  }
});

test("npm dry-run contents match every generated manifest", async () => {
  for (const domain of [...domains, "all"]) {
    const directory = path.join(packRoot, domain);
    const packed = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: directory, encoding: "utf8" }))[0];
    const names = packed.files.map(({ path: file }) => file).sort();
    assert(names.includes("awfd-pack.json"), `${domain} does not publish awfd-pack.json`);
    assert(names.includes("package.json"), `${domain} does not publish package.json`);
    if (domain !== "all") {
      const manifest = JSON.parse(await readFile(path.join(directory, "awfd-pack.json"), "utf8"));
      for (const file of manifest.files) assert(names.includes(`dist/${file}`), `${domain} npm tarball missing ${file}`);
    } else {
      assert(!names.some((file) => file.startsWith("dist/")), "all package duplicated domain payload");
    }
  }
});
