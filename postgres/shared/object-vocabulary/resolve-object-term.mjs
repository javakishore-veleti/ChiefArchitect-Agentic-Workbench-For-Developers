#!/usr/bin/env node
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const normalize=value=>String(value).trim().toLowerCase().replace(/[-_]+/g,' ').replace(/\s+/g,' ');
export function resolveObjectTerm(document,input){const target=normalize(input);const matches=(document.terms||[]).filter(row=>[row.term,...(row.aliases||[])].some(x=>normalize(x)===target));if(matches.length!==1) throw new Error(matches.length?`Ambiguous object term: ${input}`:`Unknown object term: ${input}`);return matches[0];}
export function validateVocabulary(document){const seen=new Map(),errors=[];for(const row of document.terms||[]){for(const name of [row.term,...(row.aliases||[])]){const key=normalize(name);if(seen.has(key)) errors.push(`Duplicate term or alias: ${name}`);else seen.set(key,row.term);}if(['function','procedure'].includes(row['object-type'])&&!row.signature) errors.push(`${row.term}: signature is required for overloaded callable resolution`);}return {ok:errors.length===0,errors};}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [file,...term]=process.argv.slice(2);console.log(JSON.stringify(resolveObjectTerm(JSON.parse(fs.readFileSync(file,'utf8')),term.join(' ')),null,2));}
