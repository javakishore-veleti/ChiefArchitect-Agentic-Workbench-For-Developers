import assert from "node:assert/strict";
import { access, mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { doctor, install, list, uninstall } from "../../packages/awfd/lib/awfd.mjs";

async function repositoryWithPacks(names) {
  const root = await mkdtemp(path.join(tmpdir(), "awfd-use-"));
  await mkdir(path.join(root, ".git"));
  const devDependencies = {};
  for (const name of names) {
    const packageName = `@javakishore-veleti/awfd-${name}`;
    devDependencies[packageName] = "0.1.0";
    const packageRoot = path.join(root, "node_modules", ...packageName.split("/"));
    await mkdir(path.join(packageRoot, "dist", ".agents", "skills", `awfd-${name}`), { recursive: true });
    await mkdir(path.join(packageRoot, "dist", ".claude", "skills", `awfd-${name}`), { recursive: true });
    await mkdir(path.join(packageRoot, "dist", ".github", "skills", `awfd-${name}`), { recursive: true });
    await mkdir(path.join(packageRoot, "dist", name), { recursive: true });
    for (const harness of [".agents", ".claude", ".github"]) {
      await writeFile(path.join(packageRoot, "dist", harness, "skills", `awfd-${name}`, "SKILL.md"), `${name}:${harness}\n`);
    }
    await writeFile(path.join(packageRoot, "dist", name, "README.md"), `${name}\n`);
    await writeFile(path.join(packageRoot, "awfd-pack.json"), JSON.stringify({
      schemaVersion: 1, package: packageName, domain: name, name, version: "0.1.0", payloadRoot: "dist"
    }));
  }
  await writeFile(path.join(root, "package.json"), JSON.stringify({ private: true, devDependencies }));
  return root;
}

test("installs only requested packs and selected harness adapters", async () => {
  const root = await repositoryWithPacks(["azure", "redis"]);
  const result = await install({ cwd: root, packs: ["azure"], harness: "codex,claude" });
  assert.deepEqual(result.packs, ["azure"]);
  await access(path.join(root, ".agents/skills/awfd-azure/SKILL.md"));
  await access(path.join(root, ".claude/skills/awfd-azure/SKILL.md"));
  await assert.rejects(access(path.join(root, ".github/skills/awfd-azure/SKILL.md")));
  await assert.rejects(access(path.join(root, ".agents/skills/awfd-redis/SKILL.md")));
  await access(path.join(root, "azure/README.md"));
});

test("no pack argument discovers and installs all locally installed domain packs", async () => {
  const root = await repositoryWithPacks(["azure", "redis"]);
  const result = await install({ cwd: root, packs: [] });
  assert.deepEqual([...result.packs].sort(), ["azure", "redis"]);
  await access(path.join(root, ".agents/skills/awfd-azure/SKILL.md"));
  await access(path.join(root, ".agents/skills/awfd-redis/SKILL.md"));
});

test("dry-run reports changes but writes neither payload nor state", async () => {
  const root = await repositoryWithPacks(["azure"]);
  const result = await install({ cwd: root, packs: ["azure"], dryRun: true });
  assert.ok(result.actions.some(({ action }) => action === "create"));
  await assert.rejects(access(path.join(root, ".agents/skills/awfd-azure/SKILL.md")));
  await assert.rejects(access(path.join(root, ".agentic-workbench/installation.json")));
});

test("manifest, doctor, list, and uninstall track only AWFD-managed files", async () => {
  const root = await repositoryWithPacks(["azure"]);
  await writeFile(path.join(root, "KEEP.txt"), "user-owned\n");
  await install({ cwd: root, packs: ["azure"] });

  const state = JSON.parse(await readFile(path.join(root, ".agentic-workbench/installation.json"), "utf8"));
  assert.equal(state.schemaVersion, 1);
  assert.deepEqual(Object.keys(state.packs), ["azure"]);
  assert.ok(Object.keys(state.files).every((item) => !path.isAbsolute(item) && !item.includes("..")));
  assert.equal((await doctor({ cwd: root })).ok, true);
  assert.deepEqual((await list({ cwd: root })).active, ["azure"]);

  await uninstall({ cwd: root, packs: ["azure"] });
  assert.equal(await readFile(path.join(root, "KEEP.txt"), "utf8"), "user-owned\n");
  assert.deepEqual((await list({ cwd: root })).active, []);
});
