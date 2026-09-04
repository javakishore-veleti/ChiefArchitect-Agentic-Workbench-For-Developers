#!/usr/bin/env node
import fs from 'node:fs';
const text = process.argv.slice(2).join(' ').toLowerCase();
if (!text) { console.error('Usage: classify-issue.mjs <issue text>'); process.exit(2); }
const index = JSON.parse(fs.readFileSync(new URL('../patterns/index.json', import.meta.url)));
const ranked = index.routing.map(p => ({id:p.id,title:p.title,pattern:p.pattern,score:p.signals.filter(s=>text.includes(s)).length,signals:p.signals.filter(s=>text.includes(s))})).filter(x=>x.score).sort((a,b)=>b.score-a.score || a.id.localeCompare(b.id));
console.log(JSON.stringify({matches:ranked,unclassified:ranked.length===0},null,2));
process.exit(ranked.length ? 0 : 1);
