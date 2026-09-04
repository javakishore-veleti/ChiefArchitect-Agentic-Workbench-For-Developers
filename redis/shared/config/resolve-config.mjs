#!/usr/bin/env node
import fs from 'node:fs';

export function resolveConfig(document,{environment,configName,deploymentName}={}){
  const mappings=document['configs-envs-mapping']||[];
  const matches=mappings.filter(x=>(!configName||x['config-name']===configName)&&x.envs.includes(environment));
  if(matches.length!==1) throw new Error(`Expected one config mapping for environment ${environment}; found ${matches.length}`);
  const config=document.configs.find(x=>x['config-name']===matches[0]['config-name']);
  if(!config) throw new Error(`Missing config ${matches[0]['config-name']}`);
  const deployments=deploymentName?config.deployments.filter(x=>x.name===deploymentName):config.deployments;
  if(deployments.length!==1) throw new Error(`Specify one deployment; found ${deployments.length}`);
  return {environment,'config-name':config['config-name'],deployment:deployments[0],'key-vocabulary':config['key-vocabulary']};
}
if(import.meta.url===new URL(`file://${process.argv[1]}`).href){const [file,environment,configName,deploymentName]=process.argv.slice(2); console.log(JSON.stringify(resolveConfig(JSON.parse(fs.readFileSync(file,'utf8')),{environment,configName,deploymentName}),null,2));}
