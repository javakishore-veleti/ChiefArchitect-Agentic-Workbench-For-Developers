#!/usr/bin/env node
import {fileURLToPath} from 'node:url';
const sensitive=/secret|token|password|authorization|cookie|client.?secret|private.?key/i;
function redact(value,key=''){
  if(sensitive.test(key)) return '[REDACTED]';
  if(Array.isArray(value)) return value.map(x=>redact(x));
  if(value&&typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,redact(v,k)]));
  return value;
}
export function summarizeDiagnostics(input={}){
  const clean=redact(input);
  return {context:clean.context??{},symptoms:clean.symptoms??[],errors:clean.errors??[],warnings:clean.warnings??[],observations:clean.observations??[],requestIds:clean.requestIds??[]};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){let raw=''; for await(const chunk of process.stdin) raw+=chunk; console.log(JSON.stringify(summarizeDiagnostics(JSON.parse(raw)),null,2));}
