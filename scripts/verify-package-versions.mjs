#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const expected = process.argv[2];
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(expected ?? "")) {
  throw new Error("Usage: verify-package-versions.mjs <semver>");
}

const licenseText = await readFile("LICENSE", "utf8").catch(() => "");
if (!/Apache License\s+Version 2\.0/i.test(licenseText)) {
  throw new Error("The root LICENSE must contain the Apache License 2.0 text.");
}

const roots = ["packages/awfd", "packages/packs"];
const manifests = [];

for (const root of roots) {
  const entries = root.endsWith("packs")
    ? await readdir(root, { withFileTypes: true })
    : [{ name: ".", isDirectory: () => true }];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const file = path.join(root, entry.name, "package.json");
    try {
      manifests.push([file, JSON.parse(await readFile(file, "utf8"))]);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}

if (manifests.length === 0) throw new Error("No publishable package manifests found.");
for (const [file, manifest] of manifests) {
  if (manifest.private) continue;
  if (manifest.license !== "Apache-2.0") {
    throw new Error(`${file}: expected license Apache-2.0, found ${manifest.license ?? "none"}`);
  }
  if (manifest.version !== expected) {
    throw new Error(`${file}: expected version ${expected}, found ${manifest.version}`);
  }
  for (const [dependency, version] of Object.entries(manifest.dependencies ?? {})) {
    if (dependency.startsWith("@javakishore-veleti/awfd") && version !== expected) {
      throw new Error(`${file}: expected internal dependency ${dependency}@${expected}, found ${version}`);
    }
  }
}

console.log(`Verified ${manifests.length} package versions at ${expected}.`);
