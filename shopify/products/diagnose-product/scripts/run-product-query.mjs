#!/usr/bin/env node
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const args=process.argv.slice(2);
const at=args.indexOf('--query');
if(at<0||!args[at+1]){console.error('Required: --query FILE; pass shared context arguments after it.');process.exit(2);}
const query=fs.readFileSync(args[at+1],'utf8');
if(/^\s*mutation\b/m.test(query)&&!args.includes('--allow-mutation')){console.error('Mutation blocked; add --allow-mutation only after explicit authorization.');process.exit(3);}
const shared=fileURLToPath(new URL('../../../admin-api/diagnose-admin-api/scripts/run-admin-graphql.mjs',import.meta.url));
const result=spawnSync(process.execPath,[shared,...args],{stdio:'inherit'});
process.exit(result.status??1);
