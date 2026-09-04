#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const index=JSON.parse(fs.readFileSync(path.join(here,'../patterns/index.json'),'utf8'));

export function classifyIssue(text){
  const value=String(text||'').toLowerCase();
  const ranked=Object.entries(index).map(([pattern,terms])=>({pattern,score:terms.reduce((n,t)=>n+(value.includes(t)?1:0),0)})).filter(x=>x.score).sort((a,b)=>b.score-a.score||a.pattern.localeCompare(b.pattern));
  return {selected:ranked[0]?.pattern??null,candidates:ranked};
}

if(process.argv[1]===fileURLToPath(import.meta.url)) console.log(JSON.stringify(classifyIssue(process.argv.slice(2).join(' ')),null,2));
