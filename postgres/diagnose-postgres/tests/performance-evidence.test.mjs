import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import { validateSqlPlan } from '../scripts/validate-sql-plan.mjs';

const records = fs.readFileSync(new URL('../knowledge/performance.jsonl', import.meta.url), 'utf8').trim().split('\n').map(JSON.parse);

test('performance evidence is distinct, dated and traceable to approved PostgreSQL lists', () => {
  assert.ok(records.length >= 12 && records.length <= 18);
  assert.equal(new Set(records.map(x => x.url)).size, records.length);
  for (const row of records) {
    assert.match(row.url, /^https:\/\/www\.postgresql\.org\/message-id\//);
    assert.ok(['pgsql-performance', 'pgsql-general', 'pgsql-bugs'].includes(row.list));
    assert.ok(row.date >= '2024-09-04' && row.date <= '2026-09-04');
    assert.ok(row.symptom && row.checkpoint && row.status);
  }
});

test('performance probes are single-statement production-safe read-only plans', async () => {
  for (const name of ['index-inventory.sql', 'table-statistics.sql', 'table-analyze-status.sql']) {
    const sql = await readFile(new URL(`../queries/${name}`, import.meta.url), 'utf8');
    const result = validateSqlPlan({
      sql,
      production: true,
      statementTimeoutMs: 5000,
      transactionReadOnly: true
    });
    assert.equal(result.ok, true, `${name}: ${result.errors.join(', ')}`);
  }
});
