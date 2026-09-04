#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const index=JSON.parse(fs.readFileSync(path.join(root,'patterns/index.json'),'utf8'));

export function classify(text){
  const input=String(text||'').toLowerCase();
  const ranked=index.patterns.map((pattern,order)=>({
    id:pattern.id,
    file:`patterns/${pattern.file}`,
    score:pattern.keywords.reduce((sum,word)=>sum+(input.includes(word)?1:0),0),
    order
  })).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.order-b.order);
  const matches=(ranked.length?ranked:[{id:'creation-and-schema',file:'patterns/creation-and-schema.md',score:0}]).slice(0,2);
  return {matches:matches.map(({id,file,score})=>({id,file,score}))};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  process.stdout.write(`${JSON.stringify(classify(process.argv.slice(2).join(' ')),null,2)}\n`);
}
