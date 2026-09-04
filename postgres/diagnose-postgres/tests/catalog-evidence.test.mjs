import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateSqlPlan} from '../scripts/validate-sql-plan.mjs';

const path = new URL('../knowledge/catalog-objects.jsonl', import.meta.url);
const records = (await readFile(path, 'utf8')).trim().split('\n').map(JSON.parse);

test('catalog evidence contains 10-15 distinct official mailing-list messages', () => {
  assert.ok(records.length >= 10 && records.length <= 15);
  assert.equal(new Set(records.map(r => r['source-url'])).size, records.length);
  for (const r of records) {
    assert.match(r['source-url'], /^https:\/\/www\.postgresql\.org\/message-id\//);
    assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(r.list.startsWith('pgsql-'));
  }
});

test('evidence stays within the two-year window and remains attributable', () => {
  const start = '2024-09-04';
  const end = '2026-09-04';
  for (const r of records) {
    assert.ok(r.date >= start && r.date <= end, `${r.id} is outside the window`);
    for (const field of ['id', 'status', 'area', 'symptom', 'version', 'official-doc']) {
      assert.ok(typeof r[field] === 'string' && r[field].trim(), `${r.id} missing ${field}`);
    }
    assert.match(r['official-doc'], /^https:\/\/www\.postgresql\.org\/docs\//);
  }
});

test('catalog covers schema, type, routine, constraint, and partition diagnosis', () => {
  const areas = records.map(r => r.area).join(' ');
  for (const term of ['schema', 'domain', 'function', 'foreign-key', 'partition']) {
    assert.match(areas, new RegExp(term));
  }
});

test('catalog probes are single-statement production-safe read-only plans', async () => {
  const probes = [
    'resolve-object.sql',
    'inspect-types.sql',
    'inspect-table-constraints.sql',
    'inspect-partition-tree.sql',
    'inspect-routine.sql',
    'inspect-routine-triggers.sql'
  ];
  for (const name of probes) {
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
