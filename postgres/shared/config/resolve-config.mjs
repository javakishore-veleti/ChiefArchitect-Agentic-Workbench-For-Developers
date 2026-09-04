#!/usr/bin/env node
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

function one(rows,label){if(rows.length!==1) throw new Error(`Expected one ${label}; found ${rows.length}`);return rows[0];}
export function resolveConfig(document,{environment,configName,clusterName,databaseName,contextName}={}){
  if(!environment) throw new Error('environment is required');
  const mapping=one((document['configs-envs-mapping']||[]).filter(x=>(!configName||x['config-name']===configName)&&x.envs.includes(environment)),'config mapping');
  const config=one((document.configs||[]).filter(x=>x['config-name']===mapping['config-name']),'config');
  const cluster=one(config.clusters.filter(x=>!clusterName||x.name===clusterName),'cluster');
  const database=one(cluster.databases.filter(x=>!databaseName||x.name===databaseName),'database');
  const context=one(database.contexts.filter(x=>!contextName||x.name===contextName),'connection context');
  return {environment,'config-name':config['config-name'],'object-vocabulary':config['object-vocabulary'],cluster:{...cluster,host:cluster['host-template'].replaceAll('${env}',environment),databases:undefined},database:database.name,context};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [file,environment,configName,clusterName,databaseName,contextName]=process.argv.slice(2);console.log(JSON.stringify(resolveConfig(JSON.parse(fs.readFileSync(file,'utf8')),{environment,configName,clusterName,databaseName,contextName}),null,2));}
