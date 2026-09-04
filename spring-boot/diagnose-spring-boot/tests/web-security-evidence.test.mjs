import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const evidenceUrl = new URL('../knowledge/web-security.jsonl', import.meta.url);
const start = '2024-09-04';
const end = '2026-09-04';

async function records() {
  const text = await readFile(evidenceUrl, 'utf8');
  return text.trim().split('\n').map((line) => JSON.parse(line));
}

test('web and security evidence is distinct, bounded, and official', async () => {
  const items = await records();
  assert.ok(items.length >= 18 && items.length <= 25);
  assert.equal(new Set(items.map(({ url }) => url)).size, items.length);
  for (const item of items) {
    assert.ok(item.date >= start && item.date <= end, `${item.id}: date outside window`);
    assert.match(item.url, /^https:\/\/github\.com\/spring-projects\/(spring-boot|spring-framework|spring-security)\/issues\/\d+$/);
    assert.match(item.docs, /^https:\/\/docs\.spring\.io\/(spring-boot|spring-framework|spring-security)\//);
    for (const field of ['id', 'repo', 'status', 'version', 'area', 'symptom', 'checkpoint']) {
      assert.ok(item[field], `${item.id}: missing ${field}`);
    }
  }
});

test('catalog covers both web stacks and core security decisions', async () => {
  const items = await records();
  const areas = items.map(({ area }) => area).join(' ');
  for (const term of ['mvc', 'webflux', 'validation', 'serialization', 'filter-chain', 'jwt', 'csrf', 'method-authorization', 'oidc']) {
    assert.ok(areas.includes(term), `missing ${term}`);
  }
});
