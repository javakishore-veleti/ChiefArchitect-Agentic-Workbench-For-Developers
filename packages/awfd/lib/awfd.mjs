import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { lstat, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { createRequire } from "node:module";

const SCOPE = "@javakishore-veleti";
const MANIFEST = ".agentic-workbench/installation.json";
const HARNESS_ALIASES = new Map([
  ["agents", "agents"], ["codex", "agents"], ["cursor", "agents"],
  ["antigravity", "agents"], ["claude", "claude"],
  ["github", "github"], ["copilot", "github"]
]);

const digest = (value) => createHash("sha256").update(value).digest("hex");
const packageFor = (name) => name.startsWith("@") ? name : `${SCOPE}/awfd-${name}`;
const domainFor = (name) => name.replace(/^@[^/]+\/awfd-/, "");

function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const options = { packs: [] };
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--all") options.all = true;
    else if (arg === "--target") options.target = rest[++index];
    else if (arg.startsWith("--target=")) options.target = arg.slice(9);
    else if (arg === "--harness") options.harness = rest[++index];
    else if (arg.startsWith("--harness=")) options.harness = arg.slice(10);
    else if (arg.startsWith("-")) throw new Error(`unknown option ${arg}`);
    else options.packs.push(arg);
  }
  if (("target" in options && !options.target) || ("harness" in options && !options.harness)) {
    throw new Error("an option value is missing");
  }
  return { command, options };
}

async function pathIsDirectory(path) {
  try { return (await stat(path)).isDirectory(); } catch { return false; }
}

export async function findRepositoryRoot(start = process.cwd(), explicit) {
  if (explicit) {
    const target = resolve(start, explicit);
    if (!await pathIsDirectory(target)) throw new Error(`target is not a directory: ${target}`);
    return assertSafeRoot(target);
  }
  let cursor = resolve(start);
  while (true) {
    if (existsSync(join(cursor, ".git")) || existsSync(join(cursor, "package.json"))) {
      return assertSafeRoot(cursor);
    }
    const parent = dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  throw new Error("no repository root found; run inside a repository or use --target");
}

function assertSafeRoot(root) {
  const resolved = resolve(root);
  if (resolved === resolve(sep) || resolved === resolve(homedir())) {
    throw new Error(`refusing unsafe target: ${resolved}`);
  }
  return resolved;
}

async function readJson(path, fallback) {
  try { return JSON.parse(await readFile(path, "utf8")); }
  catch (error) {
    if (error.code === "ENOENT" && fallback !== undefined) return fallback;
    throw new Error(`cannot read ${path}: ${error.message}`);
  }
}

async function findInstalledPackageJsons(root) {
  const packageJson = await readJson(join(root, "package.json"), {});
  const names = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
    ...Object.keys(packageJson.optionalDependencies ?? {})
  ].filter((name) => name.startsWith(`${SCOPE}/awfd-`) && name !== `${SCOPE}/awfd-all`));
  const allPath = join(root, "node_modules", SCOPE, "awfd-all", "awfd-pack.json");
  if (existsSync(allPath)) names.add(`${SCOPE}/awfd-all`);
  return [...names];
}

async function resolvePack(name, root) {
  const packageName = packageFor(name);
  const direct = join(root, "node_modules", ...packageName.split("/"), "awfd-pack.json");
  let descriptor = direct;
  if (!existsSync(descriptor)) {
    try {
      const require = createRequire(join(root, "package.json"));
      descriptor = require.resolve(`${packageName}/awfd-pack.json`);
    } catch {
      throw new Error(`${packageName} is not installed; add it with npm install --save-dev ${packageName}`);
    }
  }
  const pack = await readJson(descriptor);
  const packName = pack.name ?? pack.domain ?? domainFor(packageName);
  const composition = pack.composition ?? pack.packs;
  const payloadRoot = pack.payloadRoot ?? pack.payload;
  if (pack.schemaVersion !== 1 || !packName || (!payloadRoot && !Array.isArray(composition))) {
    throw new Error(`${packageName} has an invalid awfd-pack.json`);
  }
  const packageRoot = dirname(descriptor);
  if (Array.isArray(composition)) {
    return { ...pack, name: packName, composition, packageName, packageRoot };
  }
  const payload = resolve(packageRoot, payloadRoot);
  if (relative(packageRoot, payload).startsWith("..") || !await pathIsDirectory(payload)) {
    throw new Error(`${packageName} declares an invalid payload directory`);
  }
  return { ...pack, name: packName, packageName, packageRoot, payload };
}

async function discoverPacks(root, requested = [], all = false) {
  let names = requested;
  if (all || names.length === 0) names = await findInstalledPackageJsons(root);
  const expanded = [];
  for (const name of names) {
    const pack = await resolvePack(name, root);
    if (Array.isArray(pack.composition)) expanded.push(...pack.composition);
    else expanded.push(name);
  }
  return Promise.all([...new Set(expanded)].map((name) => resolvePack(name, root)));
}

function selectedHarnesses(value) {
  if (!value || value === "all") return new Set(["agents", "claude", "github"]);
  const result = new Set();
  for (const item of value.split(",").map((part) => part.trim()).filter(Boolean)) {
    const canonical = HARNESS_ALIASES.get(item);
    if (!canonical) throw new Error(`unsupported harness ${item}`);
    result.add(canonical);
  }
  return result;
}

function includeForHarness(path, harnesses) {
  if (path.startsWith(".agents/skills/")) return harnesses.has("agents");
  if (path.startsWith(".claude/skills/")) return harnesses.has("claude");
  if (path.startsWith(".github/skills/")) return harnesses.has("github");
  return true;
}

async function walkPayload(root, current = root) {
  const files = [];
  for (const entry of await readdir(current, { withFileTypes: true })) {
    const source = join(current, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`pack payload contains a symlink: ${source}`);
    if (entry.isDirectory()) files.push(...await walkPayload(root, source));
    else if (entry.isFile()) files.push({ source, target: relative(root, source).split(sep).join("/") });
  }
  return files;
}

function destinationFor(root, target) {
  if (!target || isAbsolute(target) || target.split("/").includes("..")) {
    throw new Error(`unsafe pack target: ${target}`);
  }
  const destination = resolve(root, target);
  if (!destination.startsWith(`${resolve(root)}${sep}`)) throw new Error(`unsafe pack target: ${target}`);
  return destination;
}

async function assertNoDestinationSymlinks(root, destination) {
  let cursor = destination;
  while (cursor !== root) {
    try {
      if ((await lstat(cursor)).isSymbolicLink()) {
        throw new Error(`refusing destination through symlink: ${relative(root, cursor)}`);
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    cursor = dirname(cursor);
  }
}

async function loadInstallManifest(root) {
  const path = join(root, MANIFEST);
  await assertNoDestinationSymlinks(root, path);
  const manifest = await readJson(path, { schemaVersion: 1, packs: {}, files: {} });
  if (manifest.schemaVersion !== 1 || typeof manifest.packs !== "object" || typeof manifest.files !== "object") {
    throw new Error(`invalid installation manifest: ${path}`);
  }
  return manifest;
}

async function atomicWrite(path, contents) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = join(dirname(path), `.${basename(path)}.${process.pid}.tmp`);
  await writeFile(temporary, contents, { flag: "wx" });
  await rename(temporary, path);
}

async function saveManifest(root, manifest) {
  const path = join(root, MANIFEST);
  await atomicWrite(path, `${JSON.stringify(manifest, null, 2)}\n`);
}

export async function install(options = {}) {
  const root = await findRepositoryRoot(options.cwd, options.target);
  const packs = await discoverPacks(root, options.packs, options.all);
  if (packs.length === 0) throw new Error("no AWFD packs selected or installed");
  const harnesses = selectedHarnesses(options.harness);
  const manifest = await loadInstallManifest(root);
  const actions = [];
  const planned = [];
  for (const pack of packs) {
    const files = (await walkPayload(pack.payload)).filter(({ target }) => includeForHarness(target, harnesses));
    for (const file of files) {
      const destination = destinationFor(root, file.target);
      await assertNoDestinationSymlinks(root, destination);
      const contents = await readFile(file.source);
      const hash = digest(contents);
      if (existsSync(destination)) {
        const currentHash = digest(await readFile(destination));
        const managed = manifest.files[file.target];
        if (managed && managed.pack !== pack.name && !options.force) {
          throw new Error(`refusing pack ownership conflict for ${file.target}; use --force to replace it`);
        }
        const safelyManaged = managed?.pack === pack.name && managed.hash === currentHash;
        if (currentHash !== hash && !safelyManaged && !options.force) {
          throw new Error(`refusing to overwrite modified file ${file.target}; use --force to replace it`);
        }
      }
      actions.push({ action: existsSync(destination) ? "update" : "create", path: file.target });
      planned.push({ destination, contents });
      manifest.files[file.target] = { hash, pack: pack.name };
    }
    manifest.packs[pack.name] = { package: pack.packageName, version: pack.version ?? "unknown", harnesses: [...harnesses] };
  }
  if (!options.dryRun) {
    for (const { destination, contents } of planned) await atomicWrite(destination, contents);
    await saveManifest(root, manifest);
  }
  return { root, packs: packs.map(({ name }) => name), actions };
}

export async function uninstall(options = {}) {
  const root = await findRepositoryRoot(options.cwd, options.target);
  const manifest = await loadInstallManifest(root);
  const names = options.all || options.packs?.length === 0 ? Object.keys(manifest.packs) : options.packs.map(domainFor);
  const actions = [];
  const planned = [];
  for (const [target, record] of Object.entries(manifest.files)) {
    if (!names.includes(record.pack)) continue;
    const destination = destinationFor(root, target);
    await assertNoDestinationSymlinks(root, destination);
    if (existsSync(destination)) {
      const currentHash = digest(await readFile(destination));
      if (currentHash !== record.hash && !options.force) {
        throw new Error(`refusing to remove modified file ${target}; use --force to remove it`);
      }
      actions.push({ action: "remove", path: target });
      planned.push(destination);
    }
  }
  if (!options.dryRun) {
    for (const destination of planned) await rm(destination);
    for (const [target, record] of Object.entries(manifest.files)) {
      if (names.includes(record.pack)) delete manifest.files[target];
    }
    for (const name of names) delete manifest.packs[name];
    await saveManifest(root, manifest);
  }
  return { root, packs: names, actions };
}

export async function doctor(options = {}) {
  const root = await findRepositoryRoot(options.cwd, options.target);
  const manifest = await loadInstallManifest(root);
  const problems = [];
  for (const [target, record] of Object.entries(manifest.files)) {
    const destination = destinationFor(root, target);
    await assertNoDestinationSymlinks(root, destination);
    if (!existsSync(destination)) problems.push(`${target}: missing`);
    else if (digest(await readFile(destination)) !== record.hash) problems.push(`${target}: modified`);
  }
  return { root, ok: problems.length === 0, packs: Object.keys(manifest.packs), problems };
}

export async function list(options = {}) {
  const root = await findRepositoryRoot(options.cwd, options.target);
  const installed = await findInstalledPackageJsons(root);
  const manifest = await loadInstallManifest(root);
  return { root, available: installed.map(domainFor), active: Object.keys(manifest.packs) };
}

export async function runCli(argv, io = console) {
  const { command, options } = parseArgs(argv);
  if (["help", "--help", "-h"].includes(command)) {
    io.log("Usage: awfd <list|install|update|uninstall|doctor> [packs] [--harness names] [--target dir] [--dry-run] [--force]");
    return;
  }
  let result;
  if (command === "list") result = await list(options);
  else if (command === "install") result = await install(options);
  else if (command === "update") result = await install({ ...options, packs: options.packs.length ? options.packs : Object.keys((await loadInstallManifest(await findRepositoryRoot(options.cwd, options.target))).packs) });
  else if (command === "uninstall") result = await uninstall(options);
  else if (command === "doctor") result = await doctor(options);
  else throw new Error(`unknown command ${command}`);
  io.log(JSON.stringify(result, null, 2));
  if (command === "doctor" && !result.ok) process.exitCode = 1;
  return result;
}
