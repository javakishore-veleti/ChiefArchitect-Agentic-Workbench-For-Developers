#!/usr/bin/env node
import {loadConfig, collectApplications} from './load-config.mjs';

const matchesName=(application,term)=>application.name===term||(application.aliases||[]).includes(term);

export function resolveContext(doc,{environment,configName,portfolio,program,service}={}){
  if(!environment)throw new Error('environment is required');
  const mappings=(doc['configs-envs-mapping']||[]).filter(m=>m.envs?.includes(environment)&&(!configName||m['config-name']===configName));
  if(mappings.length!==1)throw new Error(`Environment maps to ${mappings.length} configurations; specify config-name`);
  const cfg=doc.configs.find(c=>c['config-name']===mappings[0]['config-name']);
  if(!cfg)throw new Error(`Missing configuration ${mappings[0]['config-name']}`);

  let candidates=collectApplications(cfg);
  if(portfolio){
    candidates=candidates.filter(x=>x.portfolio===portfolio);
    if(!candidates.length)throw new Error(`Portfolio ${portfolio} has no applications in ${cfg['config-name']}`);
  }
  if(program){
    candidates=candidates.filter(x=>x.program===program);
    if(!candidates.length)throw new Error(`Program ${program} has no applications in ${cfg['config-name']}`);
  }
  if(service)candidates=candidates.filter(x=>matchesName(x.application,service));

  if(candidates.length!==1){
    const names=[...new Set(candidates.map(x=>x.application.name))].sort();
    throw new Error(`Service resolves to ${candidates.length} applications${names.length?`; narrow with portfolio, program or service (${names.join(', ')})`:''}`);
  }

  const {portfolio:resolvedPortfolio,program:resolvedProgram}=candidates[0];
  const application=structuredClone(candidates[0].application);
  const expand=v=>typeof v==='string'?v.replaceAll('${env}',environment):v;
  if(application.endpoints)application.endpoints=Object.fromEntries(Object.entries(application.endpoints).map(([k,v])=>[k,expand(v)]));

  return {
    environment,
    'config-name':cfg['config-name'],
    ...(resolvedPortfolio&&{portfolio:resolvedPortfolio}),
    ...(resolvedProgram&&{program:resolvedProgram}),
    'contains-phi':application['contains-phi']===true,
    application
  };
}

if(import.meta.url===`file://${process.argv[1]}`){
  const args=Object.fromEntries(process.argv.slice(2).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1)];}));
  const doc=await loadConfig({basePath:args['--file'],overrideUri:args['--override-uri']});
  console.log(JSON.stringify(resolveContext(doc,{environment:args['--env'],configName:args['--config'],portfolio:args['--portfolio'],program:args['--program'],service:args['--service']}),null,2));
}
