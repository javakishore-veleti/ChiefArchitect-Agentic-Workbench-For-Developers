#!/usr/bin/env node
import fs from 'node:fs/promises'; import {execFile as execFileCb} from 'node:child_process'; import {promisify} from 'node:util';
const execFile=promisify(execFileCb);
async function readUri(uri){
  if(!uri) return null;
  if(/^https?:\/\//i.test(uri)){const r=await fetch(uri); if(!r.ok) throw new Error(`Configuration fetch failed: HTTP ${r.status}`); return r.text();}
  if(uri.startsWith('s3://')){const {stdout}=await execFile('aws',['s3','cp',uri,'-'],{maxBuffer:10*1024*1024}); return stdout;}
  if(uri.startsWith('azblob://')){const m=/^azblob:\/\/([^/]+)\/([^/]+)\/(.+)$/.exec(uri); if(!m) throw new Error('Use azblob://ACCOUNT/CONTAINER/BLOB'); const {stdout}=await execFile('az',['storage','blob','download','--account-name',m[1],'--container-name',m[2],'--name',m[3],'--file','/dev/stdout','--auth-mode','login','--only-show-errors'],{maxBuffer:10*1024*1024}); return stdout;}
  return fs.readFile(uri.startsWith('file://')?new URL(uri):uri,'utf8');
}
export function mergeConfig(base,override){if(!override)return base; const replace=(a=[],b=[])=>{const map=new Map(a.map(x=>[x['config-name'],x])); for(const x of b) map.set(x['config-name'],x); return [...map.values()]}; return {...base,...override,'schema-version':1,'configs-envs-mapping':replace(base['configs-envs-mapping'],override['configs-envs-mapping']),'configs':replace(base.configs,override.configs)};}

// Applications may sit directly on a configuration (a single-team setup) or
// under portfolio and program tiers (an enterprise setup). Collect both so a
// caller can name as much or as little of the hierarchy as it knows.
export function collectApplications(config){
  const found=[];
  for(const application of config.applications||[])found.push({portfolio:null,program:null,application});
  for(const portfolio of config.portfolios||[]){
    for(const application of portfolio.applications||[])found.push({portfolio:portfolio.name,program:null,application});
    for(const program of portfolio.programs||[])
      for(const application of program.applications||[])found.push({portfolio:portfolio.name,program:program.name,application});
  }
  return found;
}

export function validateConfig(doc){
  if(doc?.['schema-version']!==1)throw new Error('schema-version must equal 1');
  for(const k of ['configs-envs-mapping','configs'])if(!Array.isArray(doc[k]))throw new Error(`${k} must be an array`);
  const names=new Set();
  for(const c of doc.configs){
    if(!c['config-name']||names.has(c['config-name']))throw new Error('Config names must be present and unique');
    names.add(c['config-name']);
    const entries=collectApplications(c);
    if(!entries.length)throw new Error(`Config ${c['config-name']} requires applications`);
    const seen=new Set();
    for(const {portfolio,program,application} of entries){
      if(!application.name)throw new Error('Application name is required');
      const key=[portfolio,program,application.name].join('/');
      if(seen.has(key))throw new Error(`Application ${key} is declared twice in ${c['config-name']}`);
      seen.add(key);
      const raw=JSON.stringify(application);
      if(/"(?:password|secret|token|credential)"\s*:\s*"(?!\$\{|\[?REDACTED)/i.test(raw))throw new Error('Store secret references, not secret values');
    }
  }
  return doc;
}
export async function loadConfig({basePath,overrideUri=process.env.SPRING_BOOT_CONFIG_OVERRIDE_URI}={}){const base=JSON.parse(await readUri(basePath)); const over=overrideUri?JSON.parse(await readUri(overrideUri)):null; return validateConfig(mergeConfig(base,over));}
