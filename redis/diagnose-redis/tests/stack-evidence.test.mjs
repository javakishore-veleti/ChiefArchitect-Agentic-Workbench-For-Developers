import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const file=path.resolve(here,'../knowledge/redis-stack.jsonl');
const records=fs.readFileSync(file,'utf8').trim().split('\n').map(line=>JSON.parse(line));

test('Redis Stack catalog has distinct, in-window official GitHub issues',()=>{
  assert.ok(records.length>=8&&records.length<=12,`found ${records.length}`);
  const urls=records.map(r=>r['source-url']);
  assert.equal(new Set(urls).size,urls.length);
  assert.ok(urls.every(url=>/^https:\/\/github\.com\/(RediSearch\/RediSearch|RedisTimeSeries\/RedisTimeSeries)\/issues\/\d+$/.test(url)));
  for(const record of records){
    const date=Date.parse(`${record['created-at']}T00:00:00Z`);
    assert.ok(date>=Date.parse('2024-09-04T00:00:00Z'));
    assert.ok(date<=Date.parse('2026-09-04T23:59:59Z'));
  }
});

test('each record is traceable, classified, and independently verifiable',()=>{
  const ids=new Set();
  const components=new Set();
  for(const record of records){
    assert.match(record.id,/^stack-\d{3}$/);
    assert.ok(!ids.has(record.id)); ids.add(record.id);
    assert.ok(['search-issue','timeseries-issue'].includes(record['source-type']));
    assert.ok(record.status.length>3);
    assert.ok(record.component.length>3); components.add(record.component);
    assert.ok(record.symptom.length>=50);
    assert.match(record['official-verification'],/^https:\/\/redis\.io\/docs\//);
  }
  assert.ok(components.size>=8,`only ${components.size} components`);
});
