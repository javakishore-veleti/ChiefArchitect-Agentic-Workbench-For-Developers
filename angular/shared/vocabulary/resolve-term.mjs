#!/usr/bin/env node
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const normalize=value=>String(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ');
export function resolveTerm(document,phrase,{application}={}){
  const wanted=normalize(phrase);const matches=(document.terms||[]).filter(row=>(!application||row.application===application)&&[row.term,...(row.aliases||[])].some(x=>normalize(x)===wanted));
  if(matches.length!==1) throw new Error(matches.length?`Ambiguous term: ${phrase}`:`Unknown term: ${phrase}`);return matches[0];
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [file,phrase,application]=process.argv.slice(2);console.log(JSON.stringify(resolveTerm(JSON.parse(fs.readFileSync(file,'utf8')),phrase,{application}),null,2));}
