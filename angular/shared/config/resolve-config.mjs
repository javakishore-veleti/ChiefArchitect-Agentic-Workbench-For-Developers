#!/usr/bin/env node
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const expand=(value,environment)=>typeof value==='string'?value.replaceAll('${env}',environment):value;
export function resolveConfig(document,{environment,configName,applicationName,deploymentName}={}){
  if(!environment) throw new Error('environment is required');
  const matches=(document['configs-envs-mapping']||[]).filter(x=>(!configName||x['config-name']===configName)&&x.envs.includes(environment));
  if(matches.length!==1) throw new Error(`Expected one config mapping for environment ${environment}; found ${matches.length}`);
  const config=(document.configs||[]).find(x=>x['config-name']===matches[0]['config-name']);if(!config) throw new Error(`Missing config ${matches[0]['config-name']}`);
  const apps=applicationName?config.applications.filter(x=>x.name===applicationName):config.applications;if(apps.length!==1) throw new Error(`Specify one application; found ${apps.length}`);
  const deployments=deploymentName?apps[0].deployments.filter(x=>x.name===deploymentName):apps[0].deployments;if(deployments.length!==1) throw new Error(`Specify one deployment; found ${deployments.length}`);
  const deployment=structuredClone(deployments[0]);deployment['base-url']=expand(deployment['base-url-template'],environment);deployment['api-mappings']=Object.fromEntries(Object.entries(deployment['api-mappings']||{}).map(([k,v])=>[k,expand(v,environment)]));
  return {environment,'config-name':config['config-name'],application:{name:apps[0].name,workspace:apps[0].workspace,project:apps[0].project,'repo-path':apps[0]['repo-path']},deployment,vocabulary:config.vocabulary};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [file,environment,applicationName,deploymentName,configName]=process.argv.slice(2);console.log(JSON.stringify(resolveConfig(JSON.parse(fs.readFileSync(file,'utf8')),{environment,applicationName,deploymentName,configName}),null,2));}
