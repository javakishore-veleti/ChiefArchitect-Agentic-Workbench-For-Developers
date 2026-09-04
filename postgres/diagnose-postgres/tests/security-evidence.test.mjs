import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateSqlPlan} from '../scripts/validate-sql-plan.mjs';

const root = new URL('../', import.meta.url);

test('security catalog contains distinct, dated PostgreSQL messages', async () => {
  const text = await readFile(new URL('knowledge/security.jsonl', root), 'utf8');
  const rows = text.trim().split('\n').map(line => JSON.parse(line));
  assert.ok(rows.length >= 8 && rows.length <= 12);
  assert.equal(new Set(rows.map(row => row.id)).size, rows.length);
  assert.equal(new Set(rows.map(row => row.url)).size, rows.length);
  for (const row of rows) {
    assert.match(row.url, /^https:\/\/www\.postgresql\.org\/message-id\//);
    const date = new Date(`${row.date}T00:00:00Z`);
    assert.ok(date >= new Date('2024-09-04T00:00:00Z'));
    assert.ok(date <= new Date('2026-09-04T23:59:59Z'));
    assert.ok(row.list && row.topic && row.symptom && row.finding && row.evidence && row.docs);
  }
});

test('security probes are read-only and cover identity, ACL and RLS evidence', async () => {
  const files = [
    'queries/effective-role-privileges.sql',
    'queries/default-privileges.sql',
    'queries/rls-policies.sql'
  ];
  const probes = await Promise.all(files.map(file => readFile(new URL(file, root), 'utf8')));
  for (const [index, sql] of probes.entries()) {
    const result = validateSqlPlan({sql});
    assert.equal(result.ok, true, `${files[index]}: ${result.errors.join(', ')}`);
  }
  const sql = probes.join('\n');
  assert.match(sql, /session_user/i);
  assert.match(sql, /current_user/i);
  assert.match(sql, /has_database_privilege/i);
  assert.match(sql, /has_schema_privilege/i);
  assert.match(sql, /has_table_privilege/i);
  assert.match(sql, /pg_default_acl/i);
  assert.match(sql, /pg_policy/i);
  assert.doesNotMatch(sql, /^\s*(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|GRANT|REVOKE|TRUNCATE)\b/im);
});
