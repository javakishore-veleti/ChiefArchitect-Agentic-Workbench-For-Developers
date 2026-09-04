#!/usr/bin/env node
import fs from 'node:fs';import {isDeepStrictEqual} from 'node:util';
const volatile=new Set(['id','requestId','durationMs']);
export const normalize=v=>Array.isArray(v)?v.map(normalize):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>!volatile.has(k)).sort().map(([k,n])=>[k,normalize(n)])):v;
export function compare(a,b){const left=normalize(a),right=normalize(b);return{equal:isDeepStrictEqual(left,right),leftVersion:a.apiVersion??null,rightVersion:b.apiVersion??null,leftErrors:a.errors??[],rightErrors:b.errors??[]}}
if(import.meta.url===new URL('file://'+process.argv[1]).href){const[a,b]=process.argv.slice(2);if(!a||!b){console.error('Usage: compare-responses.mjs LEFT.json RIGHT.json');process.exit(2)}console.log(JSON.stringify(compare(JSON.parse(fs.readFileSync(a)),JSON.parse(fs.readFileSync(b))),null,2))}

