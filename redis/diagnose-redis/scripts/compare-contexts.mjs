#!/usr/bin/env node
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

export function compareContexts(left,right){
  const ignore=new Set(['secret-ref','password','token','credential']);
  const keys=[...new Set([...Object.keys(left||{}),...Object.keys(right||{})])].filter(k=>!ignore.has(k)).sort();
  return keys.filter(k=>JSON.stringify(left?.[k])!==JSON.stringify(right?.[k])).map(k=>({field:k,left:left?.[k]??null,right:right?.[k]??null}));
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const x=JSON.parse(fs.readFileSync(0,'utf8')); console.log(JSON.stringify(compareContexts(x.left,x.right),null,2));}
