#!/usr/bin/env node
import fs from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const execFileAsync=promisify(execFile);
const parse=s=>JSON.parse(s);
async function readUri(uri){
  if(!uri)throw new Error('Configuration URI is required');
  if(/^https:\/\//i.test(uri)){const r=await fetch(uri,{redirect:'error'});if(!r.ok)throw new Error(`HTTPS config returned ${r.status}`);return parse(await r.text());}
  if(/^s3:\/\//i.test(uri)){const {stdout}=await execFileAsync('aws',['s3','cp',uri,'-'],{maxBuffer:4*1024*1024});return parse(stdout);}
  if(/^azblob:\/\//i.test(uri)){const m=uri.match(/^azblob:\/\/([^/]+)\/(.+)$/);if(!m)throw new Error('Use azblob://container/blob');const {stdout}=await execFileAsync('az',['storage','blob','download','--auth-mode','login','--container-name',m[1],'--name',m[2],'--file','-','--output','none'],{maxBuffer:4*1024*1024});return parse(stdout);}
  return parse(await fs.readFile(uri.replace(/^file:\/\//,''),'utf8'));
}
function merge(base,override){
  if(!override)return base;
  const out=structuredClone(base);
  for(const m of override['configs-envs-mapping']||[]){const i=out['configs-envs-mapping'].findIndex(x=>x['config-name']===m['config-name']);i<0?out['configs-envs-mapping'].push(m):out['configs-envs-mapping'][i]=m;}
  for(const c of override.configs||[]){const i=out.configs.findIndex(x=>x['config-name']===c['config-name']);i<0?out.configs.push(c):out.configs[i]=c;}
  return out;
}
export async function loadConfig({basePath,overrideUri}={}){const base=await readUri(basePath||process.env.AZURE_DIAGNOSTICS_CONFIG||new URL('./azure-config.example.json',import.meta.url).pathname);const override=overrideUri||process.env.AZURE_DIAGNOSTICS_CONFIG_OVERRIDE_URI;return merge(base,override?await readUri(override):null);}
