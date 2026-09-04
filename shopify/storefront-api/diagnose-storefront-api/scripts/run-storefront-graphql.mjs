#!/usr/bin/env node
import fs from 'node:fs';import {loadShopifyConfig} from '../../../shared/config/load-config.mjs';import {resolveConfig} from '../../../shared/config/resolve-config.mjs';import {resolveStorefrontAccess,storefrontHeaders} from './resolve-access.mjs';
const args=process.argv.slice(2),get=n=>{const i=args.indexOf(n);return i<0?undefined:args[i+1]},queryFile=get('--query');
if(!queryFile){console.error('Required: --query FILE --context-file FILE --env ENV (--config-name NAME|--storefront NAME) [--hydrogen-app NAME]');process.exit(2)}
const query=fs.readFileSync(queryFile,'utf8');if(/^\s*mutation\b/m.test(query)&&!args.includes('--allow-mutation')){console.error('Mutation blocked; explicit target authorization and --allow-mutation are required.');process.exit(3)}
try{
  const basePath=get('--context-file');if(!basePath)throw new Error('--context-file is required');
  const doc=await loadShopifyConfig({basePath,overrideUri:get('--override-uri')||process.env.SHOPIFY_CONFIG_OVERRIDE_URI});
  const config=resolveConfig(doc,{env:get('--env'),configName:get('--config-name'),storefront:get('--storefront')});
  const access=await resolveStorefrontAccess(config,{hydrogenApp:get('--hydrogen-app')});
  const version=get('--api-version')||access.version;if(!version)throw new Error('Storefront API version is required');
  const variables=JSON.parse(get('--variables')||'{}'),started=Date.now(),url='https://'+config.shopify['shop-domain']+'/api/'+version+'/graphql.json';
  const response=await fetch(url,{method:'POST',headers:storefrontHeaders(access,{buyerIp:get('--buyer-ip')}),body:JSON.stringify({query,variables})});
  const raw=await response.text(),contentType=response.headers.get('content-type')||'';let body;
  try{body=JSON.parse(raw)}catch{body=null}
  const output={httpStatus:response.status,contentType,requestId:response.headers.get('x-request-id'),apiVersion:response.headers.get('x-shopify-api-version')||version,durationMs:Date.now()-started,tokenMode:access.mode,hydrogenApp:access.app,errors:body?.errors||[],data:body?.data??null,extensions:body?.extensions??null,nonJson:body?null:raw.slice(0,160)};
  console.log(JSON.stringify(output,null,2));process.exit(response.ok&&body&&!body.errors?.length?0:1);
}catch(e){console.error(e.message);process.exit(1)}

