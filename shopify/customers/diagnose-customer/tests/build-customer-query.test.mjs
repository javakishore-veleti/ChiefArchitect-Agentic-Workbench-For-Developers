import test from 'node:test';
import assert from 'node:assert/strict';
import {buildQuery} from '../scripts/build-customer-query.mjs';

test('builds read-only surface-specific query',()=>{
  const q=buildQuery('admin','byId');
  assert.equal(q.operation,'query');assert.match(q.query,/customer\(id:/);assert.doesNotMatch(q.query,/mutation/i);
});
test('rejects cross-surface mode',()=>assert.throws(()=>buildQuery('customer-account','search'),/Unsupported mode/));
test('rejects unknown surface',()=>assert.throws(()=>buildQuery('storefront','self'),/Unsupported surface/));
