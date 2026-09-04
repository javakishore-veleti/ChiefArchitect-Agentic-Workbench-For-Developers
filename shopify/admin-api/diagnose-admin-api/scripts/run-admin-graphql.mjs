#!/usr/bin/env node
import fs from 'node:fs';
const args=process.argv.slice(2); const get=n=>{const i=args.indexOf(n); return i<0?undefined:args[i+1]};
const queryFile=get('--query'); if(!queryFile){console.error('Required: --query FILE [--variables JSON] [--allow-mutation]');process.exit(2)}
const query=fs.readFileSync(queryFile,'utf8'); const mutation=/^\s*mutation\b/m.test(query);
if(mutation&&!args.includes('--allow-mutation')){console.error('Mutation blocked; add --allow-mutation only after explicit authorization.');process.exit(3)}
const domain=process.env.SHOPIFY_SHOP_DOMAIN, token=process.env.SHOPIFY_ADMIN_ACCESS_TOKEN, version=process.env.SHOPIFY_API_VERSION;
if(!domain||!token||!version){console.error('Set SHOPIFY_SHOP_DOMAIN, SHOPIFY_ADMIN_ACCESS_TOKEN and SHOPIFY_API_VERSION.');process.exit(2)}
const variables=JSON.parse(get('--variables')||'{}'); const started=Date.now();
const response=await fetch(`https://${domain}/admin/api/${version}/graphql.json`,{method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Access-Token':token},body:JSON.stringify({query,variables})});
const body=await response.json().catch(()=>({errors:[{message:'Non-JSON response'}]}));
const output={httpStatus:response.status,requestId:response.headers.get('x-request-id'),apiVersion:version,durationMs:Date.now()-started,errors:body.errors||[],data:body.data??null,cost:body.extensions?.cost??null};
console.log(JSON.stringify(output,null,2)); process.exit(response.ok&&!body.errors?.length?0:1);
