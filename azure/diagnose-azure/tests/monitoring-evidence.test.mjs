import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const evidenceUrl = new URL('knowledge/monitoring.jsonl', root);
const patternUrl = new URL('patterns/monitoring.md', root);
const start = '2024-09-04';
const end = '2026-09-04';

async function records() {
  const raw = await readFile(evidenceUrl, 'utf8');
  return raw.trim().split('\n').map((line) => JSON.parse(line));
}

test('monitoring evidence is recent, distinct, exact and officially hosted', async () => {
  const items = await records();
  assert.ok(items.length >= 15 && items.length <= 20);
  assert.equal(new Set(items.map(({ id }) => id)).size, items.length);
  assert.equal(new Set(items.map(({ url }) => url)).size, items.length);
  for (const item of items) {
    assert.ok(item.date >= start && item.date <= end, `${item.id}: outside two-year window`);
    assert.equal(item.issue, Number(item.url.split('/').at(-1)));
    assert.match(item.url, /^https:\/\/github\.com\/(microsoft\/ApplicationInsights-(JS|dotnet))\/issues\/\d+$/i);
    assert.match(item.docs, /^https:\/\/learn\.microsoft\.com\//);
    for (const field of ['status', 'area', 'symptom', 'checkpoint', 'qualification']) {
      assert.ok(item[field], `${item.id}: missing ${field}`);
    }
  }
});

test('evidence preserves outcome strength instead of treating every report as confirmed', async () => {
  const items = await records();
  assert.ok(items.some(({ status }) => status === 'open'));
  assert.ok(items.some(({ status }) => status.includes('completed')));
  assert.ok(items.some(({ status }) => status.includes('not-planned')));
  assert.ok(items.some(({ qualification }) => /not a confirmed|unconfirmed|local reproduction|checklist only/i.test(qualification)));
});

test('monitoring pattern bounds KQL and preserves authorization boundaries', async () => {
  const pattern = await readFile(patternUrl, 'utf8');
  for (const guard of ['ago(30m)', 'take 500', 'Avoid `externaldata`', 'broad `search *`', 'requires separate authorization']) {
    assert.ok(pattern.includes(guard), `missing guard: ${guard}`);
  }
  assert.match(pattern, /connection strings/);
  assert.match(pattern, /missing child span is not proof/i);
});

test('monitoring pattern separates major failure classes', async () => {
  const pattern = await readFile(patternUrl, 'utf8');
  for (const category of ['ingestion/configuration', 'instrumentation', 'propagation/correlation', 'sampling/filtering', 'application failure', 'insufficient evidence']) {
    assert.ok(pattern.includes(category), `missing category: ${category}`);
  }
});
