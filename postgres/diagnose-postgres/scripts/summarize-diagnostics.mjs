#!/usr/bin/env node
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

export function summarizeDiagnostics(input={}){
  const rows=Array.isArray(input.rows)?input.rows:[];
  return {context:input.context||null,probe:input.probe||null,rowCount:rows.length,truncated:Boolean(input.truncated),notices:input.notices||[],error:input.error?{code:input.error.code||null,message:input.error.message||String(input.error),detail:input.error.detail||null,hint:input.error.hint||null}:null};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){console.log(JSON.stringify(summarizeDiagnostics(JSON.parse(fs.readFileSync(process.argv[2],'utf8'))),null,2));}
