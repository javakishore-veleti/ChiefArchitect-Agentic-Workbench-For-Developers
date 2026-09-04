import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const rows = (await readFile(new URL('knowledge/transactions-maintenance.jsonl', root), 'utf8'))
  .trim().split('\n').map(JSON.parse);

test('transaction and maintenance evidence is exact, distinct, and in range', () => {
  assert.ok(rows.length >= 10 && rows.length <= 15);
  assert.equal(new Set(rows.map(({id}) => id)).size, rows.length);
  assert.equal(new Set(rows.map(({source_url}) => source_url)).size, rows.length);
  for (const row of rows) {
    assert.match(row.source_url, /^https:\/\/www\.postgresql\.org\/message-id\/.+/);
    assert.ok(row.created_at >= '2024-09-04' && row.created_at <= '2026-09-04');
    assert.ok(['pgsql-general', 'pgsql-performance', 'pgsql-bugs', 'pgsql-hackers', 'pgsql-committers'].includes(row.mailing_list));
    assert.ok(['locks-deadlocks-transactions', 'vacuum-bloat-freezing'].includes(row.component));
    assert.ok(row.symptom.length >= 70);
    assert.ok(Array.isArray(row.postgres_versions) && row.postgres_versions.length > 0);
    assert.match(row.official_verification, /^https:\/\/www\.postgresql\.org\/docs\/current\//);
  }
});

test('both routed patterns have meaningful coverage', () => {
  const counts = Object.groupBy
    ? Object.groupBy(rows, ({component}) => component)
    : rows.reduce((all, row) => ((all[row.component] ??= []).push(row), all), {});
  assert.ok(counts['locks-deadlocks-transactions'].length >= 4);
  assert.ok(counts['vacuum-bloat-freezing'].length >= 6);
});

test('diagnostic SQL is read-only and avoids raw activity query text', async () => {
  for (const name of ['locks.sql', 'blocking-tree.sql', 'table-health.sql']) {
    const sql = await readFile(new URL(`queries/${name}`, root), 'utf8');
    assert.doesNotMatch(sql, /\b(pg_cancel_backend|pg_terminate_backend|vacuum|analyze|reindex|cluster|alter|drop|truncate|delete|update|insert)\s*\(/i);
    assert.doesNotMatch(sql, /\ba\.query\b|\bb\.query\b/i);
  }
});
