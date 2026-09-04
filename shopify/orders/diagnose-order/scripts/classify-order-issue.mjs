#!/usr/bin/env node
import fs from 'node:fs';
const text=process.argv.slice(2).join(' ').toLowerCase();
if(!text){console.error('Usage: classify-order-issue.mjs <issue text>');process.exit(2)}
const index=JSON.parse(fs.readFileSync(new URL('../patterns/index.json',import.meta.url)));
const matches=index.routing.map(p=>({...p,score:p.signals.filter(s=>text.includes(s)).length,matchedSignals:p.signals.filter(s=>text.includes(s))})).filter(p=>p.score).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).map(({signals,...p})=>p);
console.log(JSON.stringify({matches,unclassified:!matches.length},null,2));
process.exit(matches.length?0:1);
