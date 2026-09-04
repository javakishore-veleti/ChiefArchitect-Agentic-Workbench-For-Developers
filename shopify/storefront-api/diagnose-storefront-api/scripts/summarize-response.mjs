#!/usr/bin/env node
import fs from 'node:fs';
export function summarize(x){
  const userErrors=[],warnings=[];
  const visit=(v,p=[])=>{if(!v||typeof v!=='object')return;if(Array.isArray(v)){v.forEach((n,i)=>visit(n,[...p,i]));return}for(const[k,n]of Object.entries(v)){if(k==='userErrors'&&Array.isArray(n))n.forEach(e=>userErrors.push({path:[...p,k],field:e.field??null,message:e.message??'',code:e.code??null}));if(k==='warnings'&&Array.isArray(n))n.forEach(w=>warnings.push({path:[...p,k],message:w.message??String(w),code:w.code??null}));visit(n,[...p,k])}};visit(x.data);
  return{httpStatus:x.httpStatus??null,contentType:x.contentType??null,requestId:x.requestId??null,apiVersion:x.apiVersion??null,validJson:!x.nonJson,topLevelErrors:x.errors??[],userErrors,warnings,throttle:x.extensions?.cost?.throttleStatus??null};
}
if(import.meta.url===new URL('file://'+process.argv[1]).href){const f=process.argv[2];if(!f){console.error('Usage: summarize-response.mjs RESPONSE.json');process.exit(2)}console.log(JSON.stringify(summarize(JSON.parse(fs.readFileSync(f))),null,2))}

