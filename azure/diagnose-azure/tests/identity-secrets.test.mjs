import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

async function records(name) {
  const raw = await readFile(new URL(`knowledge/${name}-issues.jsonl`, root), 'utf8');
  return raw.trim().split('\n').map((line) => JSON.parse(line));
}

test('Key Vault and Entra evidence is recent, exact, unique, and Microsoft-owned', async () => {
  const all = [...await records('keyvault'), ...await records('entra')];
  assert.equal(all.length, 20);
  assert.equal(new Set(all.map((item) => item.id)).size, all.length);
  assert.equal(new Set(all.map((item) => item.url)).size, all.length);
  for (const item of all) {
    assert.match(item.date, /^202[4-6]-\d\d-\d\d$/);
    assert.match(item.url, /^https:\/\/github\.com\/(Azure|AzureAD)\/[\w.-]+\/issues\/\d+$/);
    assert.equal(item.url, `https://github.com/${item.repo}/issues/${item.issue}`);
    assert.ok(item.symptom.length > 35);
    assert.ok(item.checkpoint.length > 35);
    assert.match(item.qualification, /Exact public issue/);
  }
});

test('patterns preserve diagnostic boundaries and secret safety', async () => {
  const keyVault = await readFile(new URL('patterns/keyvault.md', root), 'utf8');
  const entra = await readFile(new URL('patterns/entra.md', root), 'utf8');
  assert.match(keyVault, /401/);
  assert.match(keyVault, /403/);
  assert.match(keyVault, /private-endpoint/i);
  assert.match(keyVault, /Never collect secret values/i);
  assert.match(entra, /authentication from authorization/i);
  assert.match(entra, /issuer, exact subject and audience/i);
  assert.match(entra, /client ID and object ID/i);
  assert.match(entra, /never collect access tokens/i);
});
