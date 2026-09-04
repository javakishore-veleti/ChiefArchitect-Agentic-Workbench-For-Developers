import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

async function records() {
  const raw = await readFile(new URL('knowledge/acr-issues.jsonl', root), 'utf8');
  return raw.trim().split('\n').map((line) => JSON.parse(line));
}

test('ACR evidence is exact, official, qualified, recent, and unique', async () => {
  const rows = await records();
  assert.ok(rows.length >= 15);
  assert.equal(new Set(rows.map((row) => row.url)).size, rows.length);
  for (const row of rows) {
    assert.equal(row.source, 'official-github-issue');
    assert.match(row.url, /^https:\/\/github\.com\/Azure\/(?:acr|AKS)\/issues\/\d+$/);
    assert.equal(Number(row.url.split('/').at(-1)), row.issue);
    assert.equal(row.query_window, '2024-09-04..2026-09-04');
    assert.ok(['reported-symptom', 'feature-request', 'roadmap'].includes(row.qualification));
    assert.ok(row.signals.length > 0);
    assert.ok(row.diagnostic_value.length > 30);
  }
});

test('ACR pattern preserves evidence qualification and AKS boundary', async () => {
  const pattern = await readFile(new URL('patterns/acr.md', root), 'utf8');
  assert.match(pattern, /hypotheses only/i);
  assert.match(pattern, /cannot establish an ACR outage/i);
  assert.match(pattern, /route to the AKS pattern/i);
  assert.match(pattern, /explicit authorization/i);
});

test('AKS boundary evidence is present without replacing ACR evidence', async () => {
  const rows = await records();
  assert.ok(rows.filter((row) => row.repository === 'Azure/acr').length >= 12);
  assert.ok(rows.filter((row) => row.area === 'aks-pull-boundary').length >= 3);
});
