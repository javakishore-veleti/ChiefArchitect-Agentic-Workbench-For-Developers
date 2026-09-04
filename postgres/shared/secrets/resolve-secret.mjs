#!/usr/bin/env node
import fs from 'node:fs/promises';
import {execFile as callback} from 'node:child_process';
import {promisify} from 'node:util';
const execFile=promisify(callback);

export async function resolveSecret(ref,{env=process.env,run=execFile,readFile=fs.readFile}={}){
  if(!ref?.provider||!ref.name) throw new Error('secret-ref provider and name are required');
  if(ref.provider==='environment'){if(!env[ref.name]) throw new Error(`Missing environment variable ${ref.name}`);return env[ref.name];}
  if(ref.provider==='mounted-file') return String(await readFile(ref.name,'utf8')).trim();
  if(ref.provider==='azure-key-vault'){const {stdout}=await run('az',['keyvault','secret','show','--vault-name',ref.vault,'--name',ref.name,'--query','value','-o','tsv']);return stdout.trim();}
  if(ref.provider==='aws-secrets-manager'){const {stdout}=await run('aws',['secretsmanager','get-secret-value','--secret-id',ref.name,'--query','SecretString','--output','text']);return stdout.trim();}
  if(ref.provider==='hashicorp-vault'){const {stdout}=await run('vault',['kv','get','-field',ref.key||'password',ref.name]);return stdout.trim();}
  if(ref.provider==='kubernetes-secret'){const {stdout}=await run('kubectl',['get','secret',ref.name,'-o',`jsonpath={.data.${ref.key||'password'}}`]);return Buffer.from(stdout.trim(),'base64').toString('utf8');}
  throw new Error(`Unsupported secret provider ${ref.provider}`);
}
