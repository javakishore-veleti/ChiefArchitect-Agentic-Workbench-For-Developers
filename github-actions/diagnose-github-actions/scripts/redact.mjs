#!/usr/bin/env node
import fs from 'node:fs';
const input=fs.readFileSync(process.argv[2]||0,'utf8');
let out=input.replace(/(authorization:\s*(?:bearer|basic)\s+)\S+/ig,'$1[REDACTED]')
 .replace(/((?:token|password|secret|client[_-]?secret|access[_-]?key)\s*[=:]\s*)[^\s,;}]+/ig,'$1[REDACTED]')
 .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g,'[REDACTED_GITHUB_TOKEN]')
 .replace(/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,'[REDACTED_JWT]');
process.stdout.write(out);
