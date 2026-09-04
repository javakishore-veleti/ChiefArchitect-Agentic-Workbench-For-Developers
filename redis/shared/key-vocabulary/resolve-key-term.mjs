#!/usr/bin/env node
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const norm=x=>String(x).trim().toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ');
export function resolveKeyTerm(vocabulary,term,parameters={}){
  const query=norm(term);
  const matches=(vocabulary.terms||[]).filter(x=>[x.term,...(x.aliases||[])].some(a=>norm(a)===query));
  if(matches.length!==1) throw new Error(matches.length?'Ambiguous key term':'Unknown key term');
  const definition=matches[0]; let key=definition['key-template'];
  const required=[...key.matchAll(/\{([^}]+)\}/g)].map(x=>x[1]);
  for(const name of required){if(parameters[name]===undefined||parameters[name]==='') throw new Error(`Missing key parameter: ${name}`); key=key.replaceAll(`{${name}}`,String(parameters[name]));}
  if(/[\r\n*?\[\]]/.test(key)) throw new Error('Resolved key contains an unsafe pattern or control character');
  return {term:definition.term,key,'data-type':definition['data-type'],'allowed-operations':definition['allowed-operations']};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [file,term,json='{}']=process.argv.slice(2); console.log(JSON.stringify(resolveKeyTerm(JSON.parse(fs.readFileSync(file,'utf8')),term,JSON.parse(json)),null,2));}
