#!/usr/bin/env node
let s=''; for await (const c of process.stdin) s+=c;
s=s.replace(/((?:token|authorization|password|client[_-]?secret|access[_-]?key)["']?\s*[:=]\s*["']?)([^"'\s,}]+)/gi,'$1[REDACTED]');
s=s.replace(/\bdapi[a-zA-Z0-9_-]{16,}\b/g,'[REDACTED_DATABRICKS_TOKEN]');
process.stdout.write(s);
