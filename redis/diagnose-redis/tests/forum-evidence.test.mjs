import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const evidenceUrl = new URL('../knowledge/community-forum.jsonl', import.meta.url);
const start = '2024-09-04';
const end = '2026-09-04';

async function records() {
  const text = await readFile(evidenceUrl, 'utf8');
  return text.trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

test('forum evidence uses distinct exact topic URLs inside the research window', async () => {
  const rows = await records();
  assert.ok(rows.length > 0, 'retain verified evidence, without imposing an artificial quota');
  const urls = new Set();
  for (const row of rows) {
    assert.match(row['source-url'], /^https:\/\/forum\.redis\.io\/t\/[a-z0-9-]+\/\d+$/);
    assert.equal(urls.has(row['source-url']), false, `duplicate URL: ${row['source-url']}`);
    urls.add(row['source-url']);
    assert.match(row['created-at'], /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(row['created-at'] >= start && row['created-at'] <= end, `${row.id} is outside the window`);
  }
});

test('forum evidence retains provenance, status, paraphrased symptom, and official verification', async () => {
  for (const row of await records()) {
    assert.equal(row['source-type'], 'community-forum');
    assert.ok(['answered', 'unanswered', 'support-referral'].includes(row.status));
    assert.ok(row.component && row.classification);
    assert.ok(row.symptom.length >= 40);
    assert.match(row['official-verification'], /^https:\/\/redis\.io\/docs\//);
  }
});
