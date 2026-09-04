import test from 'node:test';
import assert from 'node:assert/strict';
import {summarize} from '../scripts/summarize-customer-response.mjs';

test('collects nested user errors and request ID',()=>{
  const s=summarize({status:200,headers:{'x-request-id':'req-1'},body:{data:{customerUpdate:{customer:null,userErrors:[{field:['email'],message:'invalid'}]}}}});
  assert.equal(s.requestId,'req-1');assert.equal(s.userErrors.length,1);assert.equal(s.hasData,true);
});
test('redacts customer PII and secrets recursively',()=>{
  const s=summarize({body:{data:{customer:{id:'gid://shopify/Customer/1',email:'a@example.com',addresses:[{address1:'1 Main'}]},accessToken:'secret'}}});
  assert.equal(s.data.customer.email,'[REDACTED]');assert.equal(s.data.customer.addresses[0].address1,'[REDACTED]');assert.equal(s.data.accessToken,'[REDACTED]');
});
