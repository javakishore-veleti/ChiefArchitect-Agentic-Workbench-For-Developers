import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const evidenceUrl = new URL('knowledge/api-testing-build.jsonl', root);

async function records() {
  const text = await readFile(evidenceUrl, 'utf8');
  return text.trim().split('\n').map((line) => JSON.parse(line));
}

test('keeps 15-20 distinct, traceable cases in the two-year window', async () => {
  const cases = await records();
  assert.ok(cases.length >= 15 && cases.length <= 20);
  assert.equal(new Set(cases.map((item) => item.id)).size, cases.length);
  assert.equal(new Set(cases.map((item) => item['source-url'])).size, cases.length);
  for (const item of cases) {
    assert.match(item['source-url'], /^https:\/\/github\.com\/angular\/angular(?:-cli)?\/issues\/\d+$/);
    assert.ok(item['opened-at'] >= '2024-09-04' && item['opened-at'] <= '2026-09-04');
    assert.ok(['http-auth', 'testing', 'build-tooling'].includes(item.category));
    assert.ok(item.symptom && item.checkpoint && item.kind && item.status);
  }
});

test('covers each routed pattern with multiple cases', async () => {
  const cases = await records();
  for (const category of ['http-auth', 'testing', 'build-tooling']) {
    assert.ok(cases.filter((item) => item.category === category).length >= 5);
  }
});

test('CORS guidance attributes permission to the browser and server policy', async () => {
  const pattern = await readFile(new URL('patterns/http-auth.md', root), 'utf8');
  assert.match(pattern, /browser symptom/i);
  assert.match(pattern, /API\/gateway policy/i);
  assert.match(pattern, /Angular cannot grant cross-origin permission/i);
});

test('patterns preserve key diagnostic distinctions', async () => {
  const [http, testing, build] = await Promise.all([
    readFile(new URL('patterns/http-auth.md', root), 'utf8'),
    readFile(new URL('patterns/testing.md', root), 'utf8'),
    readFile(new URL('patterns/build-tooling.md', root), 'utf8'),
  ]);
  assert.match(http, /transport count/i);
  assert.match(testing, /clock ownership/i);
  assert.match(build, /development-server transformations from production build output/i);
});
