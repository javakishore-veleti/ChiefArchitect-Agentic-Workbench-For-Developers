#!/usr/bin/env node
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const OMIT=new Set(['id','legacyResourceId','createdAt','updatedAt']);
export function normalize(value){
  if(Array.isArray(value)) return value.map(normalize);
  if(value&&typeof value==='object') return Object.fromEntries(Object.entries(value).filter(([k])=>!OMIT.has(k)).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,normalize(v)]));
  return value;
}
export function compare(left,right){
  const a=JSON.stringify(normalize(left));
  const b=JSON.stringify(normalize(right));
  return {equal:a===b,left:normalize(left),right:normalize(right)};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  if(process.argv.length!==4) throw new Error('Usage: compare-discount-contexts.mjs LEFT.json RIGHT.json');
  const load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
  process.stdout.write(`${JSON.stringify(compare(load(process.argv[2]),load(process.argv[3])),null,2)}\n`);
}
