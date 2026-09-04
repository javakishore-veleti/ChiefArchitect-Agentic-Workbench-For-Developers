import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const url = new URL('../knowledge/clients.jsonl', import.meta.url);
const records = (await readFile(url, 'utf8')).trim().split('\n').map(JSON.parse);
const start = '2024-09-04';
const end = '2026-09-04';
const repositories = new Set(['redis/jedis', 'redis/lettuce', 'redis/node-redis', 'redis/redis-py']);

test('client catalog has 10-15 distinct evidence records', () => {
  assert.ok(records.length >= 10 && records.length <= 15);
  assert.equal(new Set(records.map((record) => record.id)).size, records.length);
  assert.equal(new Set(records.map((record) => record['source-url'])).size, records.length);
});

test('every record is an exact issue URL in the two-year window', () => {
  for (const record of records) {
    assert.match(record['source-url'], /^https:\/\/github\.com\/redis\/(jedis|lettuce|node-redis|redis-py)\/issues\/\d+$/);
    assert.ok(record['created-at'] >= start && record['created-at'] <= end, `${record.id} date is outside the window`);
    assert.ok(repositories.has(record['source-repository']));
  }
});

test('records preserve provenance, status, paraphrase, and official verification', () => {
  for (const record of records) {
    assert.equal(record['source-type'], 'client-issue');
    assert.ok(record.status.length > 0);
    assert.ok(record.component.length > 0);
    assert.ok(record.symptom.length >= 40);
    assert.match(record['official-verification'], /^https:\/\/redis\.io\/docs\//);
    assert.ok(record['evidence-level'].length > 0);
  }
});

test('all four supported client repositories are represented', () => {
  assert.deepEqual(new Set(records.map((record) => record['source-repository'])), repositories);
});
