#!/usr/bin/env node
const probes={
  admin:{byId:`query CustomerDiagnostic($id: ID!) { customer(id: $id) { id state createdAt updatedAt verifiedEmail numberOfOrders } }`,search:`query CustomerSearch($query: String!) { customers(first: 10, query: $query) { nodes { id state createdAt updatedAt } pageInfo { hasNextPage endCursor } } }`},
  'customer-account':{self:`query CustomerSelf { customer { id firstName lastName creationDate } }`,addresses:`query CustomerAddresses { customer { id addresses(first: 10) { nodes { id territoryCode } pageInfo { hasNextPage endCursor } } } }`},
  'storefront-legacy':{self:`query LegacyCustomer($customerAccessToken: String!) { customer(customerAccessToken: $customerAccessToken) { id createdAt updatedAt } }`}
};
export function buildQuery(surface,mode){
  if(!probes[surface]) throw new Error(`Unsupported surface: ${surface}`);
  if(!probes[surface][mode]) throw new Error(`Unsupported mode ${mode} for ${surface}`);
  return {surface,mode,operation:'query',query:probes[surface][mode]};
}
if(import.meta.url===new URL(`file://${process.argv[1]}`).href){
  const arg=n=>{const i=process.argv.indexOf(n);return i<0?undefined:process.argv[i+1]};
  try{console.log(JSON.stringify(buildQuery(arg('--surface'),arg('--mode')),null,2));}catch(e){console.error(e.message);process.exitCode=2;}
}
