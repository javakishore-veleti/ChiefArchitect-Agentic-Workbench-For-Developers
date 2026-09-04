import {resolveSecret} from '../../../shared/secrets/resolve-secret.mjs';
const norm=v=>String(v).replace(/[^A-Za-z0-9]/g,'_').replace(/_+/g,'_').toUpperCase();
export function selectHydrogenApp(config,name){
  const apps=config['hydrogen-apps']||[];
  if(name){const found=apps.find(x=>x.name===name);if(!found)throw new Error('Hydrogen app not found: '+name);return found}
  if(apps.length===1)return apps[0];
  if(apps.length>1)throw new Error('--hydrogen-app is required because this configuration has multiple Hydrogen apps');
  return null;
}
export async function resolveStorefrontAccess(config,{hydrogenApp,env=process.env}={}){
  const app=selectHydrogenApp(config,hydrogenApp),settings=app?.['storefront-api']||config.shopify?.['storefront-api']||{},auth=settings.authentication;
  const version=settings['api-version']||config.shopify?.['storefront-api-version']||config.shopify?.['admin-api-version'];
  if(auth){
    if(auth.mode==='tokenless')return{mode:'tokenless',version,app:app?.name||null};
    if(!['public-access-token','private-access-token'].includes(auth.mode)||!auth['access-token'])throw new Error('Invalid Storefront API authentication configuration');
    return{mode:auth.mode,token:await resolveSecret(auth['access-token']),version,app:app?.name||null};
  }
  const prefix=config['environment-variable-prefix']||env.SHOPIFY_SECRET_PREFIX||'SHOPIFY_';
  const base=prefix+norm(config.storefront)+'_'+norm(config.environment)+'_STOREFRONT_';
  const publicToken=env[base+'PUBLIC_ACCESS_TOKEN'],privateToken=env[base+'PRIVATE_ACCESS_TOKEN'];
  if(publicToken&&privateToken)throw new Error('Both scoped public and private Storefront tokens are set; choose one explicitly');
  if(publicToken)return{mode:'public-access-token',token:publicToken,version,app:app?.name||null};
  if(privateToken)return{mode:'private-access-token',token:privateToken,version,app:app?.name||null};
  return{mode:'tokenless',version,app:app?.name||null};
}
export function storefrontHeaders(access,{buyerIp}={}){
  const headers={'Content-Type':'application/json','Accept':'application/json'};
  if(access.mode==='public-access-token')headers['X-Shopify-Storefront-Access-Token']=access.token;
  if(access.mode==='private-access-token'){headers['Shopify-Storefront-Private-Token']=access.token;if(buyerIp)headers['Shopify-Storefront-Buyer-IP']=buyerIp}
  return headers;
}

