import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const evidenceUrl = new URL('knowledge/aks-issues.jsonl', root);
const routes = [
  'aks-deployments', 'aks-services', 'aks-ingress', 'aks-configuration',
  'aks-secrets', 'aks-scaling', 'aks-diagnostics'
];

async function records() {
  const text = await readFile(evidenceUrl, 'utf8');
  return text.trim().split('\n').map((line) => JSON.parse(line));
}

test('AKS evidence is distinct, recent, exact, qualified and routeable', async () => {
  const items = await records();
  assert.ok(items.length >= 20 && items.length <= 40);
  assert.equal(new Set(items.map(({ url }) => url)).size, items.length);
  for (const item of items) {
    assert.ok(item.date >= '2024-09-04' && item.date <= '2026-09-04', `${item.id}: date`);
    assert.match(item.url, /^https:\/\/github\.com\/(Azure\/AKS|kubernetes\/ingress-nginx)\/issues\/\d+$/);
    assert.ok(routes.includes(item.route), `${item.id}: unknown route`);
    for (const field of ['id', 'repo', 'issue', 'area', 'symptom', 'checkpoint', 'qualification', 'limitation']) {
      assert.ok(item[field], `${item.id}: missing ${field}`);
    }
  }
});

test('every AKS route has evidence and a concise operational pattern', async () => {
  const items = await records();
  for (const route of routes) {
    assert.ok(items.filter((item) => item.route === route).length >= 3, `${route}: evidence`);
    const pattern = await readFile(new URL(`patterns/${route}.md`, root), 'utf8');
    assert.match(pattern, /## Evidence sequence/);
    assert.match(pattern, /## Decision rules/);
    assert.match(pattern, /## Output/);
    assert.ok(pattern.split(/\s+/).length < 260, `${route}: pattern too large`);
  }
});

test('AKS patterns enforce non-mutating diagnosis and secret safety', async () => {
  const patterns = await Promise.all(routes.map((route) => readFile(new URL(`patterns/${route}.md`, root), 'utf8')));
  const joined = patterns.join('\n').toLowerCase();
  for (const concept of ['explicit approval', 'never reveal', 'do not restart', 'never scale', 'first divergence']) {
    assert.ok(joined.includes(concept), `missing safety concept: ${concept}`);
  }
});
