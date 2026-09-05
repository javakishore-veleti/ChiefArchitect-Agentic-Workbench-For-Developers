import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { install, uninstall } from "../../packages/awfd/lib/awfd.mjs";

async function fixture({ files = {}, descriptor = {}, packageName = "@javakishore-veleti/awfd-azure" } = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "awfd-test-"));
  await mkdir(path.join(root, ".git"));
  await writeFile(path.join(root, "package.json"), JSON.stringify({
    private: true,
    devDependencies: { [packageName]: "0.1.0" }
  }));
  const packageRoot = path.join(root, "node_modules", ...packageName.split("/"));
  const payloadRoot = path.join(packageRoot, "dist");
  await mkdir(payloadRoot, { recursive: true });
  for (const [relative, contents] of Object.entries(files)) {
    const destination = path.join(payloadRoot, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, contents);
  }
  await writeFile(path.join(packageRoot, "awfd-pack.json"), JSON.stringify({
    schemaVersion: 1,
    package: packageName,
    domain: "azure",
    name: "azure",
    version: "0.1.0",
    payloadRoot: "dist",
    ...descriptor
  }));
  return { root, packageRoot, payloadRoot };
}

test("installer rejects traversal from a pack payload declaration", async () => {
  const { root } = await fixture({ descriptor: { payloadRoot: "../../../../outside" } });
  await assert.rejects(install({ cwd: root, packs: ["azure"] }), /invalid payload|outside|unsafe/i);
});

test("installer rejects symlinks shipped inside a payload", async () => {
  const { root, payloadRoot } = await fixture();
  await symlink(path.join(root, "package.json"), path.join(payloadRoot, "escape.json"));
  await assert.rejects(install({ cwd: root, packs: ["azure"] }), /symlink/i);
});

test("installer rejects a symlinked destination ancestor", async () => {
  const { root } = await fixture({ files: { ".agents/skills/awfd-azure/SKILL.md": "safe" } });
  const outside = await mkdtemp(path.join(tmpdir(), "awfd-outside-"));
  await symlink(outside, path.join(root, ".agents"), "dir");
  await assert.rejects(install({ cwd: root, packs: ["azure"] }), /symlink|unsafe/i);
});

test("installer does not overwrite user content without force", async () => {
  const relative = ".agents/skills/awfd-azure/SKILL.md";
  const { root } = await fixture({ files: { [relative]: "pack\n" } });
  const target = path.join(root, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, "user\n");
  await assert.rejects(install({ cwd: root, packs: ["azure"] }), /refusing to overwrite/i);
  assert.equal(await readFile(target, "utf8"), "user\n");

  await install({ cwd: root, packs: ["azure"], force: true });
  assert.equal(await readFile(target, "utf8"), "pack\n");
});

test("uninstall preserves a user-modified managed file without force", async () => {
  const relative = ".agents/skills/awfd-azure/SKILL.md";
  const { root } = await fixture({ files: { [relative]: "pack\n" } });
  await install({ cwd: root, packs: ["azure"] });
  const target = path.join(root, relative);
  await writeFile(target, "changed\n");
  await assert.rejects(uninstall({ cwd: root, packs: ["azure"] }), /refusing to remove/i);
  assert.equal(await readFile(target, "utf8"), "changed\n");
});
