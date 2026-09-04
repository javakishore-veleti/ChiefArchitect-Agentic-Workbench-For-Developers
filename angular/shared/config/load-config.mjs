#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFile as execFileCallback} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
const execFile=promisify(execFileCallback);
export function mergeConfig(base,override={}){const replace=(a=[],b=[])=>{const rows=new Map(a.map(x=>[x['config-name'],x]));for(const row of b) rows.set(row['config-name'],row);return [...rows.values()];};return {...base,...override,'configs-envs-mapping':replace(base['configs-envs-mapping'],override['configs-envs-mapping']),configs:replace(base.configs,override.configs)};}
export async function readConfigUri(uri,{fetchImpl=globalThis.fetch,run=execFile}={}){
  if(!uri) return {};
  if(/^https?:\/\//.test(uri)){const response=await fetchImpl(uri);if(!response.ok) throw new Error(`Config fetch failed: HTTP ${response.status}`);return response.json();}
  if(uri.startsWith('s3://')){const {stdout}=await run('aws',['s3','cp',uri,'-']);return JSON.parse(stdout);}
  if(uri.startsWith('azblob://')){const match=/^azblob:\/\/([^/]+)\/([^/]+)\/(.+)$/.exec(uri);if(!match) throw new Error('Expected azblob://account/container/blob');const target=path.join(os.tmpdir(),`angular-config-${process.pid}-${Date.now()}.json`);try{await run('az',['storage','blob','download','--account-name',match[1],'--container-name',match[2],'--name',match[3],'--auth-mode','login','--file',target]);return JSON.parse(await fs.readFile(target,'utf8'));}finally{await fs.rm(target,{force:true});}}
  return JSON.parse(await fs.readFile(uri.startsWith('file://')?fileURLToPath(uri):uri,'utf8'));
}
export async function loadConfig(basePath,{overrideUri=process.env.ANGULAR_CONFIG_OVERRIDE_URI,adapters}={}){const base=JSON.parse(await fs.readFile(basePath,'utf8'));return overrideUri?mergeConfig(base,await readConfigUri(overrideUri,adapters)):base;}
