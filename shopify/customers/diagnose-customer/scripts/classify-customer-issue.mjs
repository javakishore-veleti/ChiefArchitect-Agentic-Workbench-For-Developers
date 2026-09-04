#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function classify(text,index=JSON.parse(fs.readFileSync(path.join(root,'patterns/index.json'),'utf8'))){
  const value=String(text||'').toLowerCase();
  const ranked=Object.entries(index).map(([pattern,terms])=>({pattern,score:terms.reduce((n,t)=>n+(value.includes(t.toLowerCase())?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.pattern.localeCompare(b.pattern));
  const best=ranked[0]||{pattern:'api-boundaries',score:0};
  return {pattern:best.pattern,patternFile:`patterns/${best.pattern}.md`,confidence:best.score>=2?'high':best.score===1?'medium':'low',matches:ranked.slice(0,3)};
}
if(import.meta.url===new URL(`file://${process.argv[1]}`).href){
  const i=process.argv.indexOf('--text');
  console.log(JSON.stringify(classify(i>=0?process.argv[i+1]:process.argv.slice(2).join(' ')),null,2));
}
