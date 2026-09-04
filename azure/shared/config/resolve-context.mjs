#!/usr/bin/env node
import {loadConfig} from './load-config.mjs';
function exactly(items,label){if(items.length!==1)throw new Error(`${label} resolves to ${items.length} matches`);return items[0];}
export function resolveContext(doc,{environment,configName,tenant,subscription,portfolio,program,application,resource}={}){
  if(!environment)throw new Error('environment is required');
  if(!application&&!resource)throw new Error('Specify an application or resource; scope is ambiguous');
  const mappings=doc['configs-envs-mapping'].filter(m=>m.envs.includes(environment)&&(!configName||m['config-name']===configName));
  const mapping=exactly(mappings,'environment/configuration');
  const cfg=exactly(doc.configs.filter(c=>c['config-name']===mapping['config-name']),'configuration');
  const tenants=cfg.tenants.filter(x=>!tenant||x.alias===tenant||x['tenant-id']===tenant);
  const t=exactly(tenants,'tenant');
  const subscriptions=t.subscriptions.filter(x=>!subscription||x.alias===subscription||x['subscription-id']===subscription);
  const s=exactly(subscriptions,'subscription');
  const portfolios=(s.portfolios||[]).filter(x=>!portfolio||x.name===portfolio);
  const p=portfolio?exactly(portfolios,'portfolio'):portfolios.length===1?portfolios[0]:null;
  const programs=(p?.programs||[]).filter(x=>!program||x.name===program);
  const g=program?exactly(programs,'program'):programs.length===1?programs[0]:null;
  const apps=(g?.applications||p?.applications||s.applications||[]).filter(x=>!application||x.name===application||x.aliases?.includes(application));
  const a=application?exactly(apps,'application'):apps.length===1?apps[0]:null;
  const refs=(a?.['resource-refs']||g?.['resource-refs']||p?.['resource-refs']||s['resource-refs']||[]).filter(x=>!resource||x.name===resource||x.id===resource);
  const r=resource?exactly(refs,'resource'):refs.length===1?refs[0]:null;
  const expand=value=>typeof value==='string'?value.replaceAll('${env}',environment):Array.isArray(value)?value.map(expand):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,expand(v)])):value;
  return expand({environment,'config-name':cfg['config-name'],tenant:{alias:t.alias,'tenant-id':t['tenant-id']},subscription:{alias:s.alias,'subscription-id':s['subscription-id']},...(p&&{portfolio:p.name}),...(g&&{program:g.name}),...(a&&{application:a}),...(r&&{resource:r})});
}
if(import.meta.url===`file://${process.argv[1]}`){const args=Object.fromEntries(process.argv.slice(2).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1)]}));const doc=await loadConfig({basePath:args['--file'],overrideUri:args['--override-uri']});console.log(JSON.stringify(resolveContext(doc,{environment:args['--env'],configName:args['--config'],tenant:args['--tenant'],subscription:args['--subscription'],portfolio:args['--portfolio'],program:args['--program'],application:args['--application'],resource:args['--resource']}),null,2));}
