import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { doctor, findRepositoryRoot, install, list, uninstall } from "../lib/awfd.mjs";

const scopePath = join("node_modules", "@javakishore-veleti");

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "awfd-test-"));
  await writeFile(join(root, "package.json"), JSON.stringify({
    devDependencies: { "@javakishore-veleti/awfd-azure": "0.1.0" }
  }));
  const pack = join(root, scopePath, "awfd-azure");
  await mkdir(join(pack, "dist", ".agents", "skills", "awfd-azure"), { recursive: true });
  await mkdir(join(pack, "dist", ".claude", "skills", "awfd-azure"), { recursive: true });
  await mkdir(join(pack, "dist", ".github", "skills", "awfd-azure"), { recursive: true });
  await mkdir(join(pack, "dist", "azure", "diagnose-azure"), { recursive: true });
  await writeFile(join(pack, "awfd-pack.json"), JSON.stringify({ schemaVersion: 1, name: "azure", version: "0.1.0", payloadRoot: "dist" }));
  await writeFile(join(pack, "dist", ".agents", "skills", "awfd-azure", "SKILL.md"), "agents\n");
  await writeFile(join(pack, "dist", ".claude", "skills", "awfd-azure", "SKILL.md"), "claude\n");
  await writeFile(join(pack, "dist", ".github", "skills", "awfd-azure", "SKILL.md"), "github\n");
  await writeFile(join(pack, "dist", "azure", "diagnose-azure", "SKILL.md"), "canonical-v1\n");
  return root;
}

test("findRepositoryRoot finds a parent marker and rejects broad targets", async () => {
  const root = await fixture();
  const child = join(root, "one", "two");
  await mkdir(child, { recursive: true });
  assert.equal(await findRepositoryRoot(child), root);
  await assert.rejects(findRepositoryRoot("/", "/"), /unsafe target/);
  await rm(root, { recursive: true, force: true });
});

test("list discovers installed AWFD packs", async () => {
  const root = await fixture();
  assert.deepEqual((await list({ cwd: root })).available, ["azure"]);
  await rm(root, { recursive: true, force: true });
});

test("install filters harness adapters and records hashes", async () => {
  const root = await fixture();
  const result = await install({ cwd: root, packs: ["azure"], harness: "codex,claude" });
  assert.equal(result.actions.length, 3);
  assert.equal(await readFile(join(root, ".agents/skills/awfd-azure/SKILL.md"), "utf8"), "agents\n");
  assert.equal(await readFile(join(root, ".claude/skills/awfd-azure/SKILL.md"), "utf8"), "claude\n");
  await assert.rejects(readFile(join(root, ".github/skills/awfd-azure/SKILL.md")), /ENOENT/);
  const manifest = JSON.parse(await readFile(join(root, ".agentic-workbench/installation.json")));
  assert.equal(Object.keys(manifest.files).length, 3);
  assert.deepEqual(manifest.packs.azure.harnesses, ["agents", "claude"]);
  await rm(root, { recursive: true, force: true });
});

test("dry-run reports without writing", async () => {
  const root = await fixture();
  const result = await install({ cwd: root, packs: ["azure"], dryRun: true });
  assert.equal(result.actions.length, 4);
  await assert.rejects(readFile(join(root, "azure/diagnose-azure/SKILL.md")), /ENOENT/);
  await assert.rejects(readFile(join(root, ".agentic-workbench/installation.json")), /ENOENT/);
  await rm(root, { recursive: true, force: true });
});

test("update replaces unmodified managed files but protects local changes", async () => {
  const root = await fixture();
  await install({ cwd: root, packs: ["azure"] });
  const target = join(root, "azure/diagnose-azure/SKILL.md");
  const source = join(root, scopePath, "awfd-azure/dist/azure/diagnose-azure/SKILL.md");
  await writeFile(source, "canonical-v2\n");
  await install({ cwd: root, packs: ["azure"] });
  assert.equal(await readFile(target, "utf8"), "canonical-v2\n");
  await writeFile(target, "local edit\n");
  await writeFile(source, "canonical-v3\n");
  await assert.rejects(install({ cwd: root, packs: ["azure"] }), /refusing to overwrite modified file/);
  await install({ cwd: root, packs: ["azure"], force: true });
  assert.equal(await readFile(target, "utf8"), "canonical-v3\n");
  await rm(root, { recursive: true, force: true });
});

test("doctor detects changes and uninstall protects them", async () => {
  const root = await fixture();
  await install({ cwd: root, packs: ["azure"] });
  assert.equal((await doctor({ cwd: root })).ok, true);
  const target = join(root, "azure/diagnose-azure/SKILL.md");
  await writeFile(target, "local edit\n");
  const report = await doctor({ cwd: root });
  assert.equal(report.ok, false);
  assert.match(report.problems[0], /modified/);
  await assert.rejects(uninstall({ cwd: root, packs: ["azure"] }), /refusing to remove modified file/);
  const removal = await uninstall({ cwd: root, packs: ["azure"], force: true });
  assert.equal(removal.actions.length, 4);
  await rm(root, { recursive: true, force: true });
});

test("install refuses payload and destination symlinks", async () => {
  const root = await fixture();
  const outside = await mkdtemp(join(tmpdir(), "awfd-outside-"));
  await symlink(outside, join(root, ".agents"), "dir");
  await assert.rejects(install({ cwd: root, packs: ["azure"] }), /destination through symlink/);
  await rm(join(root, ".agents"));
  const payloadLink = join(root, scopePath, "awfd-azure/dist/link");
  await symlink(outside, payloadLink, "dir");
  await assert.rejects(install({ cwd: root, packs: ["azure"] }), /payload contains a symlink/);
  await rm(root, { recursive: true, force: true });
  await rm(outside, { recursive: true, force: true });
});
