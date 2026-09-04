import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const url = new URL('../knowledge/managed-services.jsonl', import.meta.url);
const rows = (await readFile(url, 'utf8')).trim().split('\n').map((line) => JSON.parse(line));
const start = '2024-09-04';
const end = '2026-09-04';

test('managed evidence has 8-12 distinct traceable cases', () => {
  assert.ok(rows.length >= 8 && rows.length <= 12);
  assert.equal(new Set(rows.map((row) => row.id)).size, rows.length);
  assert.equal(new Set(rows.map((row) => row['source-url'])).size, rows.length);
  for (const row of rows) {
    assert.match(row['source-url'], /^https:\/\//);
    assert.match(row['official-verification'], /^https:\/\//);
    assert.match(row['created-at'], /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(row['created-at'] >= start && row['created-at'] <= end);
    assert.ok(row.status && row.symptom && row.classification && row['diagnostic-action']);
  }
});

test('provider coverage and attribution are explicit', () => {
  const providers = new Set(rows.map((row) => row.provider));
  assert.ok(providers.has('azure-cache-for-redis') || providers.has('azure-managed-redis'));
  assert.ok(providers.has('aws-elasticache'));
  assert.ok(providers.has('redis-cloud'));
  for (const row of rows) {
    assert.equal(row['provider-specific'], true);
    assert.equal(row['redis-core-defect'], false);
  }
});

test('records point to exact issue or question pages', () => {
  for (const row of rows) {
    const source = new URL(row['source-url']);
    if (source.hostname === 'github.com') assert.match(source.pathname, /\/issues\/\d+$/);
    if (source.hostname.endsWith('repost.aws')) assert.match(source.pathname, /\/questions\/QU[^/]+\/.+/);
    if (source.hostname === 'learn.microsoft.com') assert.match(source.pathname, /\/answers\/questions\/\d+\/.+/);
  }
});
