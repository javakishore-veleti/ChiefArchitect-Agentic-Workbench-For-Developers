#!/usr/bin/env node
import fs from 'node:fs/promises'; import {execFile as execFileCb} from 'node:child_process'; import {promisify} from 'node:util';
const execFile=promisify(execFileCb);
async function readUri(uri){
  if(/^https:\/\//i.test(uri)){const r=await fetch(uri);if(!r.ok)throw new Error(`Configuration fetch failed: HTTP ${r.status}`);return r.text()}
  if(uri.startsWith('s3://')){return (await execFile('aws',['s3','cp',uri,'-'],{maxBuffer:10_000_000})).stdout}
  if(uri.startsWith('azblob://')){const m=/^azblob:\/\/([^/]+)\/([^/]+)\/(.+)$/.exec(uri);if(!m)throw new Error('Use azblob://ACCOUNT/CONTAINER/BLOB');return (await execFile('az',['storage','blob','download','--account-name',m[1],'--container-name',m[2],'--name',m[3],'--file','/dev/stdout','--auth-mode','login','--only-show-errors'],{maxBuffer:10_000_000})).stdout}
  return fs.readFile(uri.startsWith('file://')?new URL(uri):uri,'utf8');
}
const mergeNamed=(a=[],b=[])=>{const m=new Map(a.map(x=>[x['config-name'],x]));for(const x of b)m.set(x['config-name'],x);return [...m.values()]};
export async function loadConfig(basePath,overrideUri){const base=JSON.parse(await readUri(basePath));const over=overrideUri?JSON.parse(await readUri(overrideUri)):null;const doc=over?{...base,...over,'schema-version':1,'configs-envs-mapping':mergeNamed(base['configs-envs-mapping'],over['configs-envs-mapping']),'configs':mergeNamed(base.configs,over.configs)}:base;
  if(doc['schema-version']!==1||!Array.isArray(doc.configs)||!Array.isArray(doc['configs-envs-mapping']))throw new Error('Invalid GitHub Actions config');
  const names=doc.configs.map(x=>x['config-name']);if(new Set(names).size!==names.length)throw new Error('Config names must be unique');
  if(/"(?:password|secret|token|credential)"\s*:\s*"(?!\$\{|\[REDACTED)/i.test(JSON.stringify(doc)))throw new Error('Store secret references, not values'); return doc;}
