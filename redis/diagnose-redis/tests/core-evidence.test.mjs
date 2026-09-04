import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const url = new URL('../knowledge/core-server.jsonl', import.meta.url);
const rows = (await readFile(url, 'utf8')).trim().split('\n').map(JSON.parse);
const allowedPatterns = new Set(['memory-eviction', 'latency-blocking', 'cluster-replication-persistence']);
const allowedEvidence = new Set(['issue-report', 'needs-investigation', 'question', 'confirmed-fix']);

test('core evidence is distinct, traceable and within the two-year window', () => {
  assert.ok(rows.length >= 10 && rows.length <= 15);
  assert.equal(new Set(rows.map(({id}) => id)).size, rows.length);
  assert.equal(new Set(rows.map(({source_url}) => source_url)).size, rows.length);

  for (const row of rows) {
    assert.match(row.source_url, /^https:\/\/github\.com\/redis\/redis\/issues\/\d+$/);
    assert.equal(row.source_type, 'core-issue');
    assert.ok(row.created_at >= '2024-09-04' && row.created_at <= '2026-09-04');
    assert.ok(row.last_activity_at >= row.created_at && row.last_activity_at <= '2026-09-04');
    assert.ok(['open', 'closed'].includes(row.status));
    assert.ok(allowedEvidence.has(row.evidence_type));
    assert.ok(allowedPatterns.has(row.pattern));
    assert.ok(row.component && row.symptom.length >= 45);
    assert.match(row.official_verification, /^https:\/\/redis\.io\/docs\//);
  }
});

test('records cover all core diagnostic patterns without duplicating symptoms', () => {
  assert.deepEqual(new Set(rows.map(({pattern}) => pattern)), allowedPatterns);
  const normalized = rows.map(({symptom}) => symptom.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim());
  assert.equal(new Set(normalized).size, rows.length);
});
