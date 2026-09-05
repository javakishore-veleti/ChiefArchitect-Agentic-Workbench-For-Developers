#!/usr/bin/env node

import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const excluded = new Set([".git", "node_modules", "dist"]);
const tests = [];

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await visit(target);
    else if (entry.name.endsWith(".test.mjs")) tests.push(target);
  }
}

await visit(".");
tests.sort();
if (tests.length === 0) throw new Error("No .test.mjs files found.");

// Several packaging tests rebuild the same generated pack directories. Keep the
// suite deterministic by preventing concurrent writers from racing on `dist/`.
const result = spawnSync(process.execPath, ["--test", "--test-concurrency=1", ...tests], { stdio: "inherit" });
process.exit(result.status ?? 1);
