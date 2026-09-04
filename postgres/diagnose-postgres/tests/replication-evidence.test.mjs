import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {validateSqlPlan} from '../scripts/validate-sql-plan.mjs';

const root = new URL('../', import.meta.url);
const evidencePath = new URL('knowledge/replication-recovery.jsonl', root);

async function records() {
  const text = await readFile(evidencePath, 'utf8');
  return text.trim().split('\n').map((line) => JSON.parse(line));
}

test('replication evidence has 8-12 distinct official messages in window', async () => {
  const items = await records();
  assert.ok(items.length >= 8 && items.length <= 12);
  assert.equal(new Set(items.map(({id}) => id)).size, items.length);
  assert.equal(new Set(items.map(({source_url}) => source_url)).size, items.length);
  for (const item of items) {
    assert.match(item.source_url, /^https:\/\/www\.postgresql\.org\/message-id\//);
    assert.ok(item.date >= '2024-09-04' && item.date <= '2026-09-04');
    for (const field of ['list', 'topic', 'category', 'symptom', 'evidence_status', 'checkpoint']) {
      assert.equal(typeof item[field], 'string');
      assert.ok(item[field].length > 0);
    }
  }
});

test('every replication probe is a single-statement production-safe read-only plan', async () => {
  const probes = [
    'server-recovery-status.sql',
    'physical-replication-status.sql',
    'logical-subscription-status.sql',
    'replication-slots.sql',
    'wal-archiver-status.sql'
  ];
  for (const name of probes) {
    const sql = await readFile(new URL(`queries/${name}`, root), 'utf8');
    const result = validateSqlPlan({
      sql,
      production: true,
      statementTimeoutMs: 5000,
      transactionReadOnly: true
    });
    assert.equal(result.ok, true, `${name}: ${result.errors.join(', ')}`);
  }
});

test('pattern expressly prohibits state-changing recovery operations', async () => {
  const pattern = await readFile(new URL('patterns/replication-recovery.md', root), 'utf8');
  for (const phrase of ['drop or advance slots', 'promote a standby', 'initiate restore/failover']) {
    assert.ok(pattern.includes(phrase));
  }
});
