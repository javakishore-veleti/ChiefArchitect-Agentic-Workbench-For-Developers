#!/usr/bin/env node
import fs from 'node:fs';
import {loadShopifyConfig} from '../../../shared/config/load-config.mjs';
import {resolveConfig} from '../../../shared/config/resolve-config.mjs';
import {resolveSecret} from '../../../shared/secrets/resolve-secret.mjs';

const args = process.argv.slice(2), get = n => { const i = args.indexOf(n); return i < 0 ? undefined : args[i + 1]; };
const queryFile = get('--query');
if (!queryFile) { console.error('Required: --query FILE [--variables JSON] [--context-file FILE --env ENV (--config-name NAME|--storefront NAME)]'); process.exit(2); }
const query = fs.readFileSync(queryFile, 'utf8');
if (/^\s*mutation\b/m.test(query) && !args.includes('--allow-mutation')) { console.error('Mutation blocked; add --allow-mutation only after explicit authorization.'); process.exit(3); }

const normalize = value => value.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
let shopDomain = process.env.SHOPIFY_SHOP_DOMAIN, apiVersion = get('--api-version') || process.env.SHOPIFY_STOREFRONT_API_VERSION;
let tokenRef;
if (get('--token-ref')) tokenRef = JSON.parse(get('--token-ref'));
const contextFile = get('--context-file');
if (contextFile) {
  const doc = await loadShopifyConfig({basePath: contextFile, overrideUri: get('--override-uri') || process.env.SHOPIFY_CONFIG_OVERRIDE_URI});
  const context = resolveConfig(doc, {env: get('--env'), configName: get('--config-name'), storefront: get('--storefront')});
  shopDomain = context.shopify['shop-domain'];
  apiVersion ||= context.shopify['storefront-api-version'] || context.shopify['admin-api-version'];
  const app = get('--hydrogen-app');
  if (app && !(context['hydrogen-apps'] || []).some(x => x.name === app)) throw new Error(`Hydrogen app is not configured in selected context: ${app}`);
  if (!tokenRef) {
    const prefix = context['environment-variable-prefix'] || process.env.SHOPIFY_SECRET_PREFIX || 'SHOPIFY_';
    tokenRef = {provider: 'environment', variable: `${prefix}${normalize(context.storefront)}_${normalize(context.environment)}_STOREFRONT_ACCESS_TOKEN`};
  }
}
tokenRef ||= {provider: 'environment', variable: 'SHOPIFY_STOREFRONT_ACCESS_TOKEN'};
if (!shopDomain || !apiVersion) { console.error('Shopify shop domain and Storefront API version are required.'); process.exit(2); }

try {
  const token = await resolveSecret(tokenRef), variables = JSON.parse(get('--variables') || '{}'), started = Date.now();
  const headers = {'Content-Type': 'application/json'};
  headers[args.includes('--private-token') ? 'Shopify-Storefront-Private-Token' : 'X-Shopify-Storefront-Access-Token'] = token;
  if (get('--buyer-ip')) headers['Shopify-Storefront-Buyer-IP'] = get('--buyer-ip');
  const response = await fetch(`https://${shopDomain}/api/${apiVersion}/graphql.json`, {method: 'POST', headers, body: JSON.stringify({query, variables})});
  const body = await response.json().catch(() => ({errors: [{message: 'Non-JSON response'}]}));
  console.log(JSON.stringify({httpStatus: response.status, requestId: response.headers.get('x-request-id'), apiVersion, durationMs: Date.now() - started, errors: body.errors || [], data: body.data ?? null, extensions: body.extensions ?? null}, null, 2));
  process.exit(response.ok && !body.errors?.length ? 0 : 1);
} catch (error) { console.error(error.message); process.exit(1); }
