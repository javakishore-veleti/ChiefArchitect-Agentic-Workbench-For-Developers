#!/usr/bin/env node
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

export function summarizeDiagnostics(rows=[]){
  const observations=rows.map(({command,result,error})=>({command,status:error?'error':'ok',evidence:error??result}));
  return {checks:observations.length,failures:observations.filter(x=>x.status==='error').length,observations};
}
if(process.argv[1]===fileURLToPath(import.meta.url)) console.log(JSON.stringify(summarizeDiagnostics(JSON.parse(fs.readFileSync(0,'utf8'))),null,2));
