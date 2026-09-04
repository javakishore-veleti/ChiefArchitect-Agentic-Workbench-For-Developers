import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {classify} from '../scripts/classify-discount-issue.mjs';
import {compare} from '../scripts/compare-discount-contexts.mjs';
import {summarize} from '../scripts/summarize-discount-response.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

test('routes Function binding failures without loading every pattern',()=>{
  const result=classify('Discount Function input variable is null after deploy');
  assert.equal(result.matches[0].id,'functions-runtime');
  assert.ok(result.matches.length<=2);
});

test('routes customer segment code failure to eligibility',()=>{
  assert.equal(classify('code rejected for eligible customer segment').matches[0].id,'code-eligibility');
});

test('summarizes nested user errors and top-level errors',()=>{
  const result=summarize({errors:[{message:'schema'}],data:{mutation:{userErrors:[{field:['code'],message:'invalid'}]}},extensions:{cost:{requestedQueryCost:4}}},{'x-request-id':'r1'});
  assert.equal(result.ok,false);
  assert.deepEqual(result.findings.map(x=>x.kind),['errors','userErrors']);
  assert.equal(result.requestId,'r1');
});

test('context comparison ignores unstable identifiers but preserves configuration',()=>{
  assert.equal(compare({id:'a',title:'T',status:'ACTIVE'},{id:'b',title:'T',status:'ACTIVE'}).equal,true);
  assert.equal(compare({title:'T',status:'ACTIVE'},{title:'T',status:'EXPIRED'}).equal,false);
});

test('community evidence is valid, unique, paraphrased, and bounded',()=>{
  const records=fs.readFileSync(path.join(root,'knowledge/community-cases.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
  assert.ok(records.length>=25&&records.length<=50);
  assert.equal(new Set(records.map(x=>x.id)).size,records.length);
  assert.equal(new Set(records.map(x=>x.source)).size,records.length);
  for(const record of records){
    assert.match(record.source,/^https:\/\/community\.shopify\.dev\/t\//);
    assert.equal(record.status,'community-report');
    assert.ok(record.symptom.length>=40);
  }
});
