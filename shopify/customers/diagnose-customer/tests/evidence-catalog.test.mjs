import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const file=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../research/community-issues.jsonl');
const records=fs.readFileSync(file,'utf8').trim().split('\n').map(line=>JSON.parse(line));
test('catalog has 25 to 50 distinct Shopify community topics',()=>{
  const urls=records.filter(r=>r.sourceType==='community').map(r=>r.source);
  assert.ok(urls.length>=25&&urls.length<=50,`found ${urls.length}`);
  assert.equal(new Set(urls).size,urls.length);
  assert.ok(urls.every(u=>/^https:\/\/community\.shopify\.dev\/t\/[a-z0-9-]+\/\d+$/.test(u)));
});
test('every record is traceable and routed',()=>{
  const patterns=new Set(['api-boundaries','authentication-and-sessions','protected-data-and-scopes','identity-and-search','profile-and-addresses','legacy-account-flows','b2b-and-context','consistency-and-webhooks']);
  for(const r of records){assert.match(r.id,/^customer-\d{3}$/);assert.ok(r.symptom.length>=30);assert.ok(patterns.has(r.pattern));assert.ok(r.status);}
});
