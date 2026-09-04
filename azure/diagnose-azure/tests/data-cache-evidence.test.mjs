import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

async function rows(name) {
  const text = await readFile(new URL(`../knowledge/${name}.jsonl`, import.meta.url), 'utf8');
  return text.trim().split('\n').map(JSON.parse);
}

for (const name of ['cosmosdb-issues', 'cache-redis-issues']) {
  test(`${name} has distinct, qualified official evidence`, async () => {
    const evidence = await rows(name);
    assert.ok(evidence.length >= 10 && evidence.length <= 15);
    assert.equal(new Set(evidence.map((row) => row.id)).size, evidence.length);
    assert.equal(new Set(evidence.map((row) => row['source-url'])).size, evidence.length);
    for (const row of evidence) {
      assert.match(row['source-url'], /^https:\/\/github\.com\/Azure\/[^/]+\/issues\/\d+$/);
      assert.equal(row.source, 'official Azure GitHub issue');
      assert.ok(row.topic?.length > 3, `${row.id} lacks topic`);
      for (const field of ['symptom', 'diagnostic-action', 'qualification']) {
        assert.ok(row[field]?.length > 15, `${row.id} lacks ${field}`);
      }
    }
  });
}

test('patterns enforce read-only, secret-safe investigation', async () => {
  for (const name of ['cosmosdb', 'cache-redis']) {
    const pattern = await readFile(new URL(`../patterns/${name}.md`, import.meta.url), 'utf8');
    assert.match(pattern, /resource ID/i);
    assert.match(pattern, /Never/);
    assert.match(pattern, /redact/i);
    assert.match(pattern, /evidence gaps/i);
  }
});
