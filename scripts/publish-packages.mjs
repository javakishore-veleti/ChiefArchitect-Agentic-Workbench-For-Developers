#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const core = "packages/awfd";
const packRoot = "packages/packs";
const packDirs = (await readdir(packRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(packRoot, entry.name));

async function manifest(directory) {
  return JSON.parse(await readFile(path.join(directory, "package.json"), "utf8"));
}

const domains = [];
let all;
for (const directory of packDirs) {
  const pkg = await manifest(directory);
  if (pkg.name === "@javakishore-veleti/awfd-all") all = directory;
  else domains.push([pkg.name, directory]);
}
domains.sort(([left], [right]) => left.localeCompare(right));

const order = [core, ...domains.map(([, directory]) => directory), ...(all ? [all] : [])];
for (const directory of order) {
  const pkg = await manifest(directory);
  if (pkg.private) continue;

  const lookup = spawnSync("npm", ["view", `${pkg.name}@${pkg.version}`, "version", "--json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (lookup.status === 0 && lookup.stdout.trim()) {
    console.log(`Skipping ${pkg.name}@${pkg.version}; it is already published.`);
    continue;
  }

  console.log(`Publishing ${pkg.name}@${pkg.version} from ${directory}.`);
  const prerelease = pkg.version.includes("-");
  const distTag = prerelease ? pkg.version.split("-", 2)[1].split(".", 1)[0] : "latest";
  const publish = spawnSync(
    "npm",
    ["publish", "--access", "public", "--provenance", "--tag", distTag],
    { cwd: directory, stdio: "inherit" }
  );
  if (publish.status !== 0) process.exit(publish.status ?? 1);
}
