#!/usr/bin/env node
import fs from 'node:fs/promises';
import {execFile as callback} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
const execFile=promisify(callback);

export function mergeConfig(base,override={}){const replace=(a=[],b=[])=>{const map=new Map(a.map(x=>[x['config-name'],x]));for(const row of b) map.set(row['config-name'],row);return [...map.values()];};return {...base,...override,'configs-envs-mapping':replace(base['configs-envs-mapping'],override['configs-envs-mapping']),configs:replace(base.configs,override.configs)};}
export async function readConfigUri(uri,{fetchImpl=globalThis.fetch,run=execFile}={}){
  if(/^https?:\/\//.test(uri)){const response=await fetchImpl(uri);if(!response.ok) throw new Error(`Config fetch failed: HTTP ${response.status}`);return response.json();}
  if(uri.startsWith('s3://')){const {stdout}=await run('aws',['s3','cp',uri,'-']);return JSON.parse(stdout);}
  if(uri.startsWith('azblob://')){const match=/^azblob:\/\/([^/]+)\/([^/]+)\/(.+)$/.exec(uri);if(!match) throw new Error('Expected azblob://account/container/blob');const {stdout}=await run('az',['storage','blob','download','--account-name',match[1],'--container-name',match[2],'--name',match[3],'--auth-mode','login','--file','/dev/stdout']);return JSON.parse(stdout);}
  return JSON.parse(await fs.readFile(uri.startsWith('file://')?fileURLToPath(uri):uri,'utf8'));
}
export function validateConfig(document){
  const errors=[];
  if(document?.['schema-version']!==1) errors.push('schema-version must be 1');
  const configs=document?.configs||[],mappings=document?.['configs-envs-mapping']||[];
  const names=new Set();
  for(const config of configs){
    if(!config['config-name']||names.has(config['config-name'])) errors.push(`duplicate or missing config-name: ${config['config-name']||''}`); names.add(config['config-name']);
    const clusters=new Set();
    for(const cluster of config.clusters||[]){
      if(clusters.has(cluster.name)) errors.push(`${config['config-name']}: duplicate cluster ${cluster.name}`); clusters.add(cluster.name);
      const databases=new Set();
      for(const database of cluster.databases||[]){
        if(databases.has(database.name)) errors.push(`${cluster.name}: duplicate database ${database.name}`); databases.add(database.name);
        const contexts=new Set();
        for(const context of database.contexts||[]){if(contexts.has(context.name)) errors.push(`${cluster.name}/${database.name}: duplicate context ${context.name}`);contexts.add(context.name);}
      }
    }
  }
  for(const mapping of mappings) if(!names.has(mapping['config-name'])) errors.push(`mapping references missing config ${mapping['config-name']}`);
  if(errors.length) throw new Error(`Invalid PostgreSQL config: ${errors.join('; ')}`);
  return document;
}
export async function loadConfig(basePath,{overrideUri=process.env.POSTGRES_CONFIG_OVERRIDE_URI,adapters}={}){const base=JSON.parse(await fs.readFile(basePath,'utf8'));return validateConfig(overrideUri?mergeConfig(base,await readConfigUri(overrideUri,adapters)):base);}
