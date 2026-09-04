#!/usr/bin/env node
import fs from 'node:fs';

const payloads = [];
function walk(value, path = []) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) { value.forEach((x, i) => walk(x, [...path, i])); return; }
  for (const [key, child] of Object.entries(value)) {
    if ((key === 'userErrors' || key === 'warnings') && Array.isArray(child) && child.length) payloads.push({path: [...path, key].join('.'), items: child});
    walk(child, [...path, key]);
  }
}
const redactId = id => typeof id === 'string' ? id.replace(/\?.*$/, '?[REDACTED]') : id;
export function summarizeCartResponse(input) {
  payloads.length = 0; walk(input.data);
  const cart = input.data?.cart || Object.values(input.data || {}).find(x => x?.cart)?.cart;
  return {
    transport: {httpStatus: input.httpStatus, requestId: input.requestId, apiVersion: input.apiVersion, durationMs: input.durationMs},
    graphqlErrors: input.errors || [], mutationSignals: [...payloads],
    cart: cart ? {id: redactId(cart.id), createdAt: cart.createdAt, updatedAt: cart.updatedAt, totalQuantity: cart.totalQuantity, lineCount: cart.lines?.nodes?.length, hasMoreLines: cart.lines?.pageInfo?.hasNextPage, discounts: cart.discountCodes, deliveryGroupCount: cart.deliveryGroups?.nodes?.length, subtotal: cart.cost?.subtotalAmount, total: cart.cost?.totalAmount} : null
  };
}
if (import.meta.url === new URL('file://' + process.argv[1]).href) console.log(JSON.stringify(summarizeCartResponse(JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))), null, 2));
