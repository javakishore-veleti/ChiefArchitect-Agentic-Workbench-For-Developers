#!/usr/bin/env node
const domains={
  carts:/\bcart|checkout|delivery|line item|buyer identity\b/i,
  products:/\bproduct|variant|collection|inventory|metafield|metaobject|catalog price\b/i,
  customers:/\bcustomer|login|account api|access token create|passwordless\b/i,
  orders:/\border|fulfillment|return\b/i,
  discounts:/\bdiscount|promo|coupon|code\b/i
};
const patterns={
  'auth-access':/\b401|403|unauthori[sz]ed|access denied|token|scope|permission|credential|sales channel\b/i,
  'context-localization':/\bmarket|country|currency|language|locale|translation|incontext|company location|buyer context\b/i,
  'publication-visibility':/\bunpublished|publication|published|not visible|missing resource|returns null\b/i,
  'version-schema':/\bapi version|schema|deprecated|unknown field|doesn't exist|release candidate|nullability\b/i,
  'throttle-performance':/\b429|throttl|rate limit|timeout|slow|latency|query cost\b/i,
  'hydrogen-runtime':/\bhydrogen|oxygen|remix|hydration|loader|cache|stale|navigation|session|server component\b/i,
  'response-errors':/\binternal server|html|non-json|graphql error|parse|500|502|503|200 status\b/i
};
export function classify(text){
  const input=String(text||'');
  for(const [route,re] of Object.entries(domains))if(re.test(input))return{kind:'domain',route,reason:'resource-specific'};
  const scored=Object.entries(patterns).map(([route,re])=>[route,(input.match(re)||[]).length]).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  return{kind:'pattern',route:scored[0]?.[0]||'response-errors',reason:scored.length?'keyword-match':'safe-default'};
}
if(import.meta.url===new URL('file://'+process.argv[1]).href){console.log(JSON.stringify(classify(process.argv.slice(2).join(' '))))}

