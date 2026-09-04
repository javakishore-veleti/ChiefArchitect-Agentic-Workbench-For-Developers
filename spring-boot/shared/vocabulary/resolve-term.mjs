#!/usr/bin/env node
import fs from 'node:fs';
const norm=s=>String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g,' ');
export function validateVocabulary(doc){if(doc?.['schema-version']!==1||!Array.isArray(doc.terms))throw new Error('Invalid vocabulary'); const seen=new Map(); for(const entry of doc.terms){for(const value of [entry.term,...(entry.aliases||[])]){const n=norm(value); if(seen.has(n))throw new Error(`Duplicate vocabulary phrase: ${value}`); seen.set(n,entry);}} return doc;}
export function resolveTerm(doc,input){validateVocabulary(doc); const n=norm(input); const matches=doc.terms.filter(e=>[e.term,...(e.aliases||[])].some(v=>norm(v)===n)); if(matches.length!==1)throw new Error(matches.length?'Ambiguous term':'Unknown term'); return matches[0];}
if(import.meta.url===`file://${process.argv[1]}`){const doc=JSON.parse(fs.readFileSync(process.argv[2]||process.env.SPRING_BOOT_VOCABULARY_PATH,'utf8')); console.log(JSON.stringify(resolveTerm(doc,process.argv.slice(3).join(' ')),null,2));}
