import test from 'node:test';
import assert from 'node:assert/strict';
import {classify} from '../scripts/classify-customer-issue.mjs';

test('routes protected data separately from authentication',()=>{
  const r=classify('403 ACCESS_DENIED for protected customer data firstName scope');
  assert.equal(r.pattern,'protected-data-and-scopes');
  assert.equal(r.confidence,'high');
});
test('routes legacy password token flow',()=>assert.equal(classify('customerAccessTokenCreate invalid credentials on legacy account').pattern,'legacy-account-flows'));
test('unknown symptoms start at API boundary with low confidence',()=>{
  const r=classify('something unexpected happened');
  assert.equal(r.pattern,'api-boundaries');assert.equal(r.confidence,'low');
});
