#!/usr/bin/env node
import fs from 'node:fs';
import {summarizeCartResponse} from './summarize-cart-response.mjs';

export function compareCartContexts(left, right) {
  const a = summarizeCartResponse(left), b = summarizeCartResponse(right), differences = [];
  const fields = ['transport.apiVersion','cart.id','cart.updatedAt','cart.totalQuantity','cart.lineCount','cart.hasMoreLines','cart.deliveryGroupCount','cart.subtotal.amount','cart.subtotal.currencyCode','cart.total.amount','cart.total.currencyCode'];
  const value = (o, p) => p.split('.').reduce((x, k) => x?.[k], o);
  for (const field of fields) if (JSON.stringify(value(a, field)) !== JSON.stringify(value(b, field))) differences.push({field, left: value(a, field), right: value(b, field)});
  return {differences, leftSignals: {graphqlErrors: a.graphqlErrors.length, mutationSignals: a.mutationSignals.length}, rightSignals: {graphqlErrors: b.graphqlErrors.length, mutationSignals: b.mutationSignals.length}};
}
if (import.meta.url === new URL('file://' + process.argv[1]).href) console.log(JSON.stringify(compareCartContexts(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))), null, 2));
