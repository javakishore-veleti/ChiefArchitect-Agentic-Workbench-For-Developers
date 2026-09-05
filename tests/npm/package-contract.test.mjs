import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const domains = [
  "angular", "azure", "databricks", "datadog", "github-actions",
  "postgres", "redis", "shopify", "spring-boot"
];

async function json(relative) {
  return JSON.parse(await readFile(path.join(root, relative), "utf8"));
}

test("build produces one scoped domain package plus core and all", async () => {
  const workspaces = (await readdir(path.join(root, "packages/packs"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  assert.deepEqual(workspaces, [...domains, "all"].sort());
  assert.equal((await json("packages/awfd/package.json")).name, "@javakishore-veleti/awfd");
  assert.equal((await json("packages/packs/all/package.json")).name, "@javakishore-veleti/awfd-all");
});

test("domain manifests and generated payloads satisfy the AWFD contract", async () => {
  for (const domain of domains) {
    const base = `packages/packs/${domain}`;
    const packageJson = await json(`${base}/package.json`);
    const manifest = await json(`${base}/awfd-pack.json`);

    assert.equal(packageJson.name, `@javakishore-veleti/awfd-${domain}`);
    assert.equal(manifest.schemaVersion, 1);
    assert.equal(manifest.package, packageJson.name);
    assert.equal(manifest.domain, domain);
    assert.equal(manifest.payloadRoot, "dist");
    assert.ok(manifest.skills.length > 0, `${domain} should declare at least one router`);
    assert.ok(manifest.files.length > 0, `${domain} should contain a payload`);

    for (const skill of manifest.skills) {
      assert.match(skill.id, /^awfd-[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.match(skill.coordinate, /^awfd:[a-z0-9]+(?:-[a-z0-9]+)*(?::[a-z0-9]+(?:-[a-z0-9]+)*)?$/);
      assert.ok(!skill.coordinate.includes("awfd:shopify-admin:"), `malformed coordinate ${skill.coordinate}`);
      for (const harness of [".agents", ".claude", ".github"]) {
        const adapter = path.join(root, base, "dist", harness, "skills", skill.id, "SKILL.md");
        assert.equal((await stat(adapter)).isFile(), true, `missing ${harness} adapter for ${skill.id}`);
        const text = await readFile(adapter, "utf8");
        assert.match(text, new RegExp(`^---\\nname: ${skill.id.replaceAll("-", "\\-")}$`, "m"));
        assert.match(text, new RegExp(`awfd-coordinate: ["']${skill.coordinate.replaceAll("-", "\\-")}["']`));
      }
    }

    assert.deepEqual(
      [...manifest.files].sort((left, right) => left.localeCompare(right)),
      manifest.files,
      `${domain} file list must be deterministic`
    );
    for (const relative of manifest.files) {
      assert.ok(!path.isAbsolute(relative) && !relative.split("/").includes(".."), `unsafe manifest path ${relative}`);
      assert.equal((await stat(path.join(root, base, "dist", relative))).isFile(), true);
    }
  }
});

test("all package composes exactly the domain packs without duplicating payload", async () => {
  const manifest = await json("packages/packs/all/awfd-pack.json");
  const expected = domains.map((domain) => `@javakishore-veleti/awfd-${domain}`).sort();
  assert.deepEqual([...manifest.composition].sort(), expected);
  assert.equal(new Set(manifest.composition).size, domains.length);
  await assert.rejects(stat(path.join(root, "packages/packs/all/dist")), { code: "ENOENT" });
});

test("published packages contain no install lifecycle hooks", async () => {
  const manifests = ["packages/awfd/package.json", ...domains.map((d) => `packages/packs/${d}/package.json`), "packages/packs/all/package.json"];
  for (const relative of manifests) {
    const packageJson = await json(relative);
    for (const hook of ["preinstall", "install", "postinstall"]) {
      assert.equal(packageJson.scripts?.[hook], undefined, `${relative} must not run ${hook}`);
    }
  }
});

test("release artifacts do not contain private keys or credential-shaped tokens", async () => {
  const forbidden = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bnpm_[A-Za-z0-9]{30,}\b/,
    /\bAKIA[0-9A-Z]{16}\b/
  ];
  for (const domain of domains) {
    const manifest = await json(`packages/packs/${domain}/awfd-pack.json`);
    for (const relative of manifest.files) {
      const contents = await readFile(path.join(root, `packages/packs/${domain}/dist`, relative), "utf8");
      for (const pattern of forbidden) assert.doesNotMatch(contents, pattern, `${domain}/${relative}`);
    }
  }
});
