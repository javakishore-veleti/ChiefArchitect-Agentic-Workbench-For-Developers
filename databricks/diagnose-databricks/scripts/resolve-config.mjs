#!/usr/bin/env node
import fs from 'node:fs';
const envName=process.argv[2];
const source=process.env.DATABRICKS_WORKBENCH_CONFIG;
if(source && /^(https?|s3|az|abfss?):\/\//i.test(source)) throw new Error('Remote config must be materialized by the approved harness');
let doc;
if(source) doc=JSON.parse(fs.readFileSync(source,'utf8'));
else doc={"configs-envs-mapping":[{"config-name":"environment","envs":[envName||process.env.DATABRICKS_ENV||'default']}],configs:[{"config-name":"environment",account:{"account-id":process.env.DATABRICKS_ACCOUNT_ID},workspaces:[{name:'environment',host:process.env.DATABRICKS_HOST,"workspace-id":process.env.DATABRICKS_WORKSPACE_ID}],environments:{[envName||process.env.DATABRICKS_ENV||'default']:{workspace:'environment',catalog:process.env.DATABRICKS_CATALOG,schema:process.env.DATABRICKS_SCHEMA}},auth:{method:'environment'}}]};
const mappings=doc['configs-envs-mapping']||[];
const selected=envName ? mappings.find(x=>(x.envs||[]).includes(envName)) : mappings[0];
if(!selected) throw new Error('No configuration maps the requested environment');
const config=(doc.configs||[]).find(x=>x['config-name']===selected['config-name']);
if(!config) throw new Error('Mapped configuration is missing');
process.stdout.write(JSON.stringify({environment:envName||selected.envs?.[0],config},null,2));
