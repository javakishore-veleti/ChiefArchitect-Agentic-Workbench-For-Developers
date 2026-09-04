#!/usr/bin/env node
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const index=JSON.parse(fs.readFileSync(new URL('../patterns/index.json',import.meta.url),'utf8'));
export function classifyIssue(text){
  const value=` ${String(text||'').toLowerCase()} `;
  const candidates=Object.entries(index).map(([pattern,terms])=>({pattern,score:terms.reduce((n,t)=>n+(value.includes(t)?1:0),0)})).filter(x=>x.score).sort((a,b)=>b.score-a.score||a.pattern.localeCompare(b.pattern));
  return {selected:candidates[0]?.pattern??null,candidates};
}
if(process.argv[1]===fileURLToPath(import.meta.url)) console.log(JSON.stringify(classifyIssue(process.argv.slice(2).join(' ')),null,2));
