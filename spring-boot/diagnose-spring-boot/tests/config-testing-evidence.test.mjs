import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const evidenceUrl = new URL('../knowledge/config-testing.jsonl', import.meta.url);
const start = '2024-09-04';
const end = '2026-09-04';

async function records() {
  const text = await readFile(evidenceUrl, 'utf8');
  return text.trim().split('\n').map((line) => JSON.parse(line));
}

test('configuration and testing evidence is distinct, bounded, and official', async () => {
  const items = await records();
  assert.ok(items.length >= 15 && items.length <= 20);
  assert.equal(new Set(items.map(({ url }) => url)).size, items.length);
  assert.equal(new Set(items.map(({ id }) => id)).size, items.length);
  for (const item of items) {
    assert.ok(item.date >= start && item.date <= end, `${item.id}: date outside window`);
    assert.equal(item.repo, 'spring-projects/spring-boot');
    assert.equal(item.issue, Number(item.url.split('/').at(-1)));
    assert.match(item.url, /^https:\/\/github\.com\/spring-projects\/spring-boot\/issues\/\d+$/);
    assert.match(item.docs, /^https:\/\/docs\.spring\.io\/spring-(boot|framework)\//);
    for (const field of ['id', 'status', 'version', 'area', 'symptom', 'checkpoint']) {
      assert.ok(item[field], `${item.id}: missing ${field}`);
    }
  }
});

test('catalog covers configuration and test boundaries', async () => {
  const items = await records();
  const areas = items.map(({ area }) => area).join(' ');
  for (const term of ['configuration-properties', 'profiles', 'config-data', 'secret', 'condition', 'testing-data-slices', 'testcontainers', 'context-cache', 'aot', 'native']) {
    assert.ok(areas.includes(term), `missing ${term}`);
  }
});

test('closed weak reports retain evidence status', async () => {
  const items = await records();
  assert.ok(items.some(({ status }) => status.includes('invalid')));
  assert.ok(items.some(({ status }) => status.includes('duplicate')));
  assert.ok(items.some(({ status }) => status.includes('declined')));
  assert.ok(items.some(({ status }) => status.includes('external-project')));
});
