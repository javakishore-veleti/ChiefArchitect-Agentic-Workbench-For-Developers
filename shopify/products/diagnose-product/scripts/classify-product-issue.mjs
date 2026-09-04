#!/usr/bin/env node
import fs from 'node:fs';
const input=process.argv.slice(2).join(' ').trim().toLowerCase();
if(!input){console.error('Usage: classify-product-issue.mjs <issue text>');process.exit(2);}
const index=JSON.parse(fs.readFileSync(new URL('../patterns/index.json',import.meta.url)));
const matches=index.routing.map(p=>({...p,signals:p.signals.filter(s=>input.includes(s))})).map(p=>({id:p.id,title:p.title,pattern:p.pattern,score:p.signals.length,signals:p.signals})).filter(p=>p.score>0).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
console.log(JSON.stringify({matches,unclassified:matches.length===0},null,2));
process.exit(matches.length?0:1);
