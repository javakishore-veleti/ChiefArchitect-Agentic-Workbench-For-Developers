#!/usr/bin/env node
import fs from 'node:fs'; import {isDeepStrictEqual} from 'node:util';
const [a,b]=process.argv.slice(2); if(!a||!b){console.error('Usage: compare-graphql.mjs LEFT.json RIGHT.json');process.exit(2)}
const clean=v=>{if(Array.isArray(v))return v.map(clean);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).filter(([k])=>!['id','requestId'].includes(k)).sort().map(([k,n])=>[k,clean(n)]));return v};
const left=clean(JSON.parse(fs.readFileSync(a))),right=clean(JSON.parse(fs.readFileSync(b))); console.log(JSON.stringify({equal:isDeepStrictEqual(left,right),left,right},null,2));
