#!/usr/bin/env node
import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync(process.argv[2]||0,'utf8'));
const blocked=/\b(rerun|re-run|dispatch|approve|cancel|delete|remove|deploy|rollback|release|register|deregister|rotate|set-secret|put-secret|update-permission|disable|enable)\b/i;
const actions=(data.actions||[]).map(x=>typeof x==='string'?x:JSON.stringify(x));
const violations=actions.filter(x=>blocked.test(x));
console.log(JSON.stringify({safe:violations.length===0,violations},null,2));
if(violations.length) process.exit(2);
