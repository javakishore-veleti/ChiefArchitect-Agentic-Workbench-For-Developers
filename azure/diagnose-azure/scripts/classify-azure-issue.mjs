#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const index=JSON.parse(fs.readFileSync(path.join(here,'../patterns/index.json'),'utf8'));
export function classify(text){
  const q=String(text||'').toLowerCase();
  const scored=index.routes.map((r,i)=>({id:r.id,skill:r.skill,score:r.keywords.reduce((n,k)=>n+(q.includes(k)?1:0),0),i})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.i-b.i);
  if(!scored.length)return {status:'needs-clarification',message:'Provide the symptom and affected Azure service or resource.'};
  const top=scored[0];
  const tied=scored.filter(x=>x.score===top.score);
  return tied.length>1?{status:'ambiguous',candidates:tied.map(({id,skill})=>({id,skill}))}:{status:'matched',route:top.id,skill:top.skill};
}
if(import.meta.url===`file://${process.argv[1]}`)console.log(JSON.stringify(classify(process.argv.slice(2).join(' ')),null,2));
