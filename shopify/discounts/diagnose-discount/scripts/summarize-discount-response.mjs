#!/usr/bin/env node
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

function visit(value,path=[],out=[]){
  if(Array.isArray(value)) value.forEach((item,i)=>visit(item,[...path,i],out));
  else if(value&&typeof value==='object'){
    for(const [key,item] of Object.entries(value)){
      if((key==='errors'||key==='userErrors'||key==='warnings')&&Array.isArray(item)){
        for(const detail of item) out.push({kind:key,path:[...path,key].join('.'),detail});
      }
      visit(item,[...path,key],out);
    }
  }
  return out;
}

export function summarize(payload,headers={}){
  const findings=visit(payload);
  const extensions=payload?.extensions||{};
  return {
    ok:findings.filter(x=>x.kind!=='warnings').length===0,
    findings,
    requestId:headers['x-request-id']||headers['X-Request-Id']||null,
    cost:extensions.cost||null,
    throttleStatus:extensions.cost?.throttleStatus||null
  };
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const file=process.argv[2];
  const input=file?fs.readFileSync(file,'utf8'):fs.readFileSync(0,'utf8');
  process.stdout.write(`${JSON.stringify(summarize(JSON.parse(input)),null,2)}\n`);
}
