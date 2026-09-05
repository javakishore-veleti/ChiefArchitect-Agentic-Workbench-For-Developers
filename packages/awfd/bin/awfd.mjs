#!/usr/bin/env node
import { runCli } from "../lib/awfd.mjs";

runCli(process.argv.slice(2)).catch((error) => {
  console.error(`awfd: ${error.message}`);
  process.exitCode = 1;
});
