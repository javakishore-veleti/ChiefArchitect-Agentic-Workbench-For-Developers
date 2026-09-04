import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const evidenceUrl = new URL('../knowledge/framework-components.jsonl', import.meta.url);
const from = '2024-09-04';
const through = '2026-09-04';

async function records() {
  return (await readFile(evidenceUrl, 'utf8')).trim().split('\n').map((line) => JSON.parse(line));
}

test('framework evidence has 12-18 distinct official Angular issues in the research window', async () => {
  const rows = await records();
  assert.ok(rows.length >= 12 && rows.length <= 18);
  assert.equal(new Set(rows.map(({id}) => id)).size, rows.length);
  assert.equal(new Set(rows.map((row) => row['source-url'])).size, rows.length);
  for (const row of rows) {
    assert.match(row['source-url'], /^https:\/\/github\.com\/angular\/angular\/issues\/\d+$/);
    assert.ok(row['opened-at'] >= from && row['opened-at'] <= through);
    assert.match(row['official-verification'], /^https:\/\/angular\.dev\//);
    assert.ok(row.symptom.length >= 40);
    assert.ok(row.status);
    assert.ok(row['angular-version']);
    assert.ok(row['evidence-level']);
  }
});

test('framework evidence covers each routed pattern', async () => {
  const rows = await records();
  const counts = rows.reduce((all, {area}) => all.set(area, (all.get(area) ?? 0) + 1), new Map());
  assert.ok(counts.get('components-signals') >= 5);
  assert.ok(counts.get('forms-templates') >= 5);
  assert.ok(counts.get('ssr-hydration') >= 5);
});

test('records distinguish reports and requests from confirmed defects', async () => {
  const rows = await records();
  const levels = new Set(rows.map((row) => row['evidence-level']));
  assert.ok(levels.has('community-report'));
  assert.ok(levels.has('feature-request'));
  assert.ok(levels.has('unreproduced-report'));
});
