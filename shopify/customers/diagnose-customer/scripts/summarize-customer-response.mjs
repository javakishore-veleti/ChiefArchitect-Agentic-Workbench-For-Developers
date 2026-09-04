#!/usr/bin/env node
import fs from 'node:fs';

const sensitive=/token|secret|password|authorization|cookie|email|phone|firstName|lastName|address1|address2/i;
function clean(value,key=''){
  if(sensitive.test(key)) return '[REDACTED]';
  if(Array.isArray(value)) return value.map(v=>clean(v));
  if(value&&typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clean(v,k)]));
  return value;
}
export function summarize(response){
  const body=response?.body??response??{};
  const payloadErrors=[];
  const walk=v=>{if(!v||typeof v!=='object')return;if(Array.isArray(v)){v.forEach(walk);return;}for(const[k,x]of Object.entries(v)){if(/userErrors$/i.test(k)&&Array.isArray(x))payloadErrors.push(...x);else walk(x);}};
  walk(body.data);
  const headers=response?.headers||{};
  return clean({httpStatus:response?.status??null,requestId:headers['x-request-id']||headers['x-shopify-request-id']||null,topLevelErrors:body.errors||[],userErrors:payloadErrors,hasData:body.data!=null,data:body.data??null});
}
if(import.meta.url===new URL(`file://${process.argv[1]}`).href){
  const i=process.argv.indexOf('--file');
  const raw=i>=0?fs.readFileSync(process.argv[i+1],'utf8'):fs.readFileSync(0,'utf8');
  console.log(JSON.stringify(summarize(JSON.parse(raw)),null,2));
}
