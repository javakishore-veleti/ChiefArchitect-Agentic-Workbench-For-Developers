#!/usr/bin/env node
const fragments={
  CUSTOMER:'Customer',COMPANY:'Company',COMPANY_LOCATION:'CompanyLocation',
  PRODUCT:'Product',PRODUCT_VARIANT:'ProductVariant',COLLECTION:'Collection',
  ORDER:'Order',DRAFT_ORDER:'DraftOrder',
  DISCOUNT_CODE:'DiscountCodeNode',DISCOUNT_AUTOMATIC:'DiscountAutomaticNode'
};

export function buildMetafieldQuery(mapping){
  const fragment=fragments[mapping?.['owner-type']];if(!fragment)throw new Error('Unsupported owner type: '+(mapping?.['owner-type']||'missing'));
  if(!mapping.namespace||!mapping.key)throw new Error('namespace and key are required');
  return {operation:'query',variables:{namespace:mapping.namespace,key:mapping.key},query:`query BusinessMetafield($id: ID!, $namespace: String!, $key: String!) { node(id: $id) { id ... on ${fragment} { metafield(namespace: $namespace, key: $key) { namespace key type value jsonValue createdAt updatedAt } } } }`};
}
