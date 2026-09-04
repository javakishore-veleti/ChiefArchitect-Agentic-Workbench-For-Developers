import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {classifyCartIssue} from '../scripts/classify-cart-issue.mjs';
import {summarizeCartResponse} from '../scripts/summarize-cart-response.mjs';
import {compareCartContexts} from '../scripts/compare-cart-contexts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('classifier routes API and UI symptoms without loading every pattern', () => {
  const api = classifyCartIssue('cartLinesAdd says merchandise does not exist for variant inventory');
  assert.equal(api.selected[0], 'lines-inventory');
  assert.ok(api.selected.length <= 2);
  const ui = classifyCartIssue('Hydrogen cart drawer is stale after optimistic update');
  assert.equal(ui.selected[0], 'hydrogen-sync');
});

test('summarizer preserves signals and redacts cart key', () => {
  const summary = summarizeCartResponse({httpStatus: 200, requestId: 'r1', apiVersion: '2026-04', data: {cartLinesAdd: {cart: {id: 'gid://shopify/Cart/1?key=secret', totalQuantity: 2, lines: {nodes: [{}, {}], pageInfo: {hasNextPage: false}}, cost: {totalAmount: {amount: '20', currencyCode: 'USD'}}}, userErrors: [], warnings: [{code: 'MERCHANDISE_NOT_ADDED', message: 'adjusted'}]}}});
  assert.equal(summary.cart.id, 'gid://shopify/Cart/1?[REDACTED]');
  assert.equal(summary.cart.lineCount, 2);
  assert.equal(summary.mutationSignals[0].path, 'cartLinesAdd.warnings');
});

test('context comparison emits deterministic material differences', () => {
  const response = (quantity, currency) => ({data: {cart: {id: 'gid://shopify/Cart/1?key=x', totalQuantity: quantity, lines: {nodes: [], pageInfo: {}}, cost: {totalAmount: {amount: '10', currencyCode: currency}}}}});
  const result = compareCartContexts(response(1, 'USD'), response(2, 'CAD'));
  assert.deepEqual(result.differences.map(x => x.field), ['cart.totalQuantity', 'cart.total.currencyCode']);
});

test('mutation runner blocks before credential or network access', () => {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts/run-storefront-graphql.mjs'), '--query', path.join(root, 'queries/cart-create-minimal.graphql')], {encoding: 'utf8'});
  assert.equal(result.status, 3);
  assert.match(result.stderr, /Mutation blocked/);
});

test('community evidence contains real, unique, categorized URLs', () => {
  const evidence = JSON.parse(fs.readFileSync(path.join(root, 'knowledge/community-cases.json'), 'utf8'));
  assert.ok(evidence.cases.length >= 25 && evidence.cases.length <= 50);
  assert.equal(new Set(evidence.cases.map(x => x.url)).size, evidence.cases.length);
  assert.ok(evidence.cases.every(x => x.url.startsWith('https://community.shopify.dev/t/') && x.category && x.symptom && x.status === 'community-report'));
});

test('diagnostic query covers cart evidence and pagination state', () => {
  const query = fs.readFileSync(path.join(root, 'queries/cart-diagnostic.graphql'), 'utf8');
  for (const field of ['buyerIdentity', 'discountCodes', 'deliveryGroups', 'checkoutUrl', 'hasNextPage']) assert.match(query, new RegExp(field));
});
