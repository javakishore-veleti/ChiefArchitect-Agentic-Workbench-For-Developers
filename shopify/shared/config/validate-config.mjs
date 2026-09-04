#!/usr/bin/env node
import fs from 'node:fs';
export function validateConfig(doc){
 const errors=[]; if(doc?.['schema-version']!==1)errors.push('schema-version must be 1');
 const maps=doc?.['configs-envs-mapping']; const configs=doc?.configs;
 if(!Array.isArray(maps))errors.push('configs-envs-mapping must be an array');
 if(!Array.isArray(configs))errors.push('configs must be an array');
 if(errors.length)return errors;
 const names=new Set(); for(const c of configs){if(!c?.['config-name'])errors.push('every config needs config-name');else if(names.has(c['config-name']))errors.push('duplicate config-name: '+c['config-name']);else names.add(c['config-name']);if(!c?.storefront)errors.push('config '+(c?.['config-name']||'?')+' needs storefront');if(!c?.shopify)errors.push('config '+(c?.['config-name']||'?')+' needs shopify');if(!Array.isArray(c?.['hydrogen-apps']))errors.push('config '+(c?.['config-name']||'?')+' needs hydrogen-apps array')}
 const pairs=new Set(); for(const m of maps){const n=m?.['config-name'];if(!names.has(n))errors.push('mapping references missing config: '+n);if(!Array.isArray(m?.envs)||!m.envs.length)errors.push('mapping '+(n||'?')+' needs envs');for(const e of m?.envs||[]){if(typeof e!=='string'||!e)errors.push('environment names must be non-empty strings');const k=n+'\0'+e;if(pairs.has(k))errors.push('duplicate config/environment mapping: '+n+'/'+e);pairs.add(k)}}
 return errors;
}
if(import.meta.url===new URL('file://'+process.argv[1]).href){const f=process.argv[2];if(!f){console.error('Usage: validate-config.mjs CONFIG.json');process.exit(2)}const errors=validateConfig(JSON.parse(fs.readFileSync(f)));console.log(JSON.stringify({valid:!errors.length,errors},null,2));process.exit(errors.length?1:0)}
