#!/usr/bin/env node
import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);

const args = Object.fromEntries(process.argv.slice(2).map((v,i,a)=>v.startsWith('--')?[v.slice(2),a[i+1]]:null).filter(Boolean));
const baseRef = args.config || process.env.DATADOG_DIAGNOSTICS_CONFIG;
const overrideRef = args['override-uri'] || process.env.DATADOG_DIAGNOSTICS_CONFIG_OVERRIDE_URI;
if (!baseRef || !args.env) { console.error('require --env and --config or DATADOG_DIAGNOSTICS_CONFIG'); process.exit(2); }

async function load(ref) {
  if (/^https:\/\//.test(ref)) { const res=await fetch(ref); if(!res.ok) throw new Error(`fetch failed: ${res.status}`); return res.json(); }
  if (/^(s3|az|azure-blob):\/\//.test(ref)) {
    const cmd=process.env.DATADOG_DIAGNOSTICS_CONFIG_FETCH_CMD;
    if(!cmd) throw new Error('cloud URI requires DATADOG_DIAGNOSTICS_CONFIG_FETCH_CMD');
    const {stdout}=await run(cmd,[ref],{maxBuffer:2_000_000}); return JSON.parse(stdout);
  }
  return JSON.parse(await fs.readFile(ref,'utf8'));
}
function merge(a,b){ if(Array.isArray(a)||Array.isArray(b)) return b; if(a&&b&&typeof a==='object'&&typeof b==='object') return Object.fromEntries([...new Set([...Object.keys(a),...Object.keys(b)])].map(k=>[k,k in b?merge(a[k],b[k]):a[k]])); return b; }
const base=await load(baseRef); const config=overrideRef?merge(base,await load(overrideRef)):base;
const names=(config['configs-envs-mapping']||[]).filter(m=>(m.envs||[]).includes(args.env)).map(m=>m['config-name']);
if(names.length!==1) throw new Error(`environment must resolve to one config; matched ${names.length}`);
const matches=(config.configs||[]).filter(c=>c['config-name']===names[0]);
if(matches.length!==1) throw new Error(`config ${names[0]} must exist exactly once`);
const selected=structuredClone(matches[0]); delete selected.auth;
if(args.service){ const services=(selected.services||[]).filter(s=>s.name===args.service||(s.aliases||[]).includes(args.service)); if(services.length!==1) throw new Error(`service must resolve exactly once; matched ${services.length}`); selected.service=services[0]; }
console.log(JSON.stringify({environment:args.env,...selected},null,2));
