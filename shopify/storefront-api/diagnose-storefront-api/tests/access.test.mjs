import test from 'node:test';import assert from 'node:assert/strict';import {resolveStorefrontAccess,storefrontHeaders} from '../scripts/resolve-access.mjs';
const config={storefront:'storefront-a',environment:'qa',shopify:{'admin-api-version':'2026-04'},'hydrogen-apps':[{name:'web'}]};
test('uses scoped public token fallback',async()=>{const a=await resolveStorefrontAccess(config,{env:{SHOPIFY_STOREFRONT_A_QA_STOREFRONT_PUBLIC_ACCESS_TOKEN:'secret'}});assert.equal(a.mode,'public-access-token');assert.equal(storefrontHeaders(a)['X-Shopify-Storefront-Access-Token'],'secret')});
test('does not cross environment scope',async()=>{const a=await resolveStorefrontAccess(config,{env:{SHOPIFY_STOREFRONT_A_PROD_STOREFRONT_PUBLIC_ACCESS_TOKEN:'wrong'}});assert.equal(a.mode,'tokenless')});
test('requires app selection when multiple exist',async()=>assert.rejects(()=>resolveStorefrontAccess({...config,'hydrogen-apps':[{name:'one'},{name:'two'}]},{env:{}}),/--hydrogen-app/));
test('private token gets server header and buyer IP',async()=>{const a=await resolveStorefrontAccess(config,{env:{SHOPIFY_STOREFRONT_A_QA_STOREFRONT_PRIVATE_ACCESS_TOKEN:'private'}});const h=storefrontHeaders(a,{buyerIp:'192.0.2.1'});assert.equal(h['Shopify-Storefront-Private-Token'],'private');assert.equal(h['Shopify-Storefront-Buyer-IP'],'192.0.2.1')});

