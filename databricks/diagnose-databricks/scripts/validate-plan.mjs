#!/usr/bin/env node
import fs from 'node:fs';
const p=JSON.parse(fs.readFileSync(process.argv[2]||0,'utf8'));
const commands=Array.isArray(p.commands)?p.commands:[];
const forbidden=/\b(delete|drop|truncate|alter|create|replace|insert|update|merge|grant|revoke|repair|reset|restart|cancel|terminate|destroy)\b|\b(dbfs\s+rm|workspace\s+delete|clusters\s+delete|jobs\s+delete)\b/i;
const leaks=/(token|secret|password|client[_-]?secret)\s*[=:]\s*[^$<{\s][^\s]*/i;
const failures=[];
for(const [i,c] of commands.entries()) { const s=typeof c==='string'?c:c.command||''; if(forbidden.test(s)) failures.push(`command ${i}: mutation requires an authorized plan`); if(leaks.test(s)) failures.push(`command ${i}: inline secret`); }
if(failures.length){console.error(failures.join('\n'));process.exit(2)}
console.log(JSON.stringify({valid:true,commands:commands.length}));
