#!/usr/bin/env node
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

export function classifyIssue(text,index){
  const value=String(text||'').toLowerCase();
  const ranked=Object.entries(index).map(([pattern,row])=>({pattern,file:row.file,score:(row.keywords||[]).reduce((n,k)=>n+(value.includes(k.toLowerCase())?1:0),0)})).sort((a,b)=>b.score-a.score||a.pattern.localeCompare(b.pattern));
  return {selected:ranked[0]?.score?ranked[0]:null,candidates:ranked.filter(x=>x.score>0)};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const index=JSON.parse(fs.readFileSync(new URL('../patterns/index.json',import.meta.url),'utf8'));
  console.log(JSON.stringify(classifyIssue(process.argv.slice(2).join(' '),index),null,2));
}
