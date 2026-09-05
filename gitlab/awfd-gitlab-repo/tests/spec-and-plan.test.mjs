import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {toPath, parseMarkdown, normalizeManifest, extractTables} from '../scripts/parse-spec.mjs';
import {validatePlan, ALLOWED_OPERATIONS} from '../scripts/validate-plan.mjs';

const table = `
| Service | Portfolio | Program | Boot |
|---|---|---|---|
| \`patient-identity-service\` | Patients | Identity | 2.7 |
| \`appointment-service\` | Patients | Scheduling | 3.4 |
| \`audit-service\` | Platform | Audit | 3.3 |
`;

// ---- parsing

test('normalizes any label into a legal GitLab path', () => {
  assert.equal(toPath('Lab Ops'), 'lab-ops');
  assert.equal(toPath('  Billing & Revenue Cycle '), 'billing-revenue-cycle');
  assert.equal(toPath('--Already-Sluggish--'), 'already-sluggish');
  assert.equal(toPath(''), '');
});

test('parses a markdown table into groups and projects', () => {
  const manifest = parseMarkdown(table);
  assert.equal(manifest.projects.length, 3);
  assert.deepEqual(manifest.projects[0], {
    name: 'patient-identity-service', group: 'patients/identity', metadata: {boot: '2.7'}
  });
  assert.ok(manifest.groups.some(g => g.full === 'patients' && g.parent === null));
  assert.ok(manifest.groups.some(g => g.full === 'patients/identity' && g.parent === 'patients'));
});

test('carries unmapped columns as metadata and drops empty cells', () => {
  const manifest = parseMarkdown(`
| Service | Portfolio | Cache |
|---|---|---|
| \`a-service\` | Patients | Redis |
| \`b-service\` | Patients | — |
`);
  assert.deepEqual(manifest.projects[0].metadata, {cache: 'Redis'});
  assert.deepEqual(manifest.projects[1].metadata, {});
});

test('collapses a tier that repeats its parent', () => {
  const manifest = parseMarkdown(`
| Service | Portfolio | Context |
|---|---|---|
| \`worklist-service\` | Lab Ops | Lab Ops |
| \`accessioning-service\` | Lab Ops | Specimen |
`);
  assert.equal(manifest.projects[0].group, 'lab-ops');
  assert.equal(manifest.projects[1].group, 'lab-ops/specimen');
  assert.equal(manifest.groups.filter(g => g.full === 'lab-ops/lab-ops').length, 0);
});

test('honours an explicit tier ordering', () => {
  const manifest = parseMarkdown(table, {tiers: ['portfolio']});
  assert.equal(manifest.projects[0].group, 'patients');
  assert.equal(manifest.groups.length, 2);
});

test('ignores tables inside fenced code blocks', () => {
  const withFence = '```\n| Service | Portfolio |\n|---|---|\n| `fake` | Nope |\n```\n' + table;
  assert.equal(extractTables(withFence).length, 1);
});

test('refuses a document with no usable table', () => {
  assert.throws(() => parseMarkdown('# Nothing here\n\nJust prose.'), /No table found/);
});

test('reports project paths that collide after normalization', () => {
  const manifest = parseMarkdown(`
| Service | Portfolio |
|---|---|
| \`Order Service\` | Patients |
| \`order-service\` | Patients |
`);
  assert.deepEqual(manifest.collisions, ['patients/order-service']);
});

test('normalizes a JSON manifest and rejects an entry with no group', () => {
  const manifest = normalizeManifest({projects: [{name: 'A Service', group: 'Patients/Identity'}]});
  assert.equal(manifest.projects[0].name, 'a-service');
  assert.equal(manifest.projects[0].group, 'patients/identity');
  assert.throws(() => normalizeManifest({projects: [{name: 'x'}]}), /has no group/);
  assert.throws(() => normalizeManifest({}), /requires a projects array/);
});

test('parses the shipped AKIV architecture document end to end', () => {
  const doc = new URL('../../../Examples/Healthcare/Payer/AKIV-Diagnostics/EnterpriseArchitecture.md', import.meta.url);
  const manifest = parseMarkdown(fs.readFileSync(doc, 'utf8'));
  assert.equal(manifest.projects.length, 40);
  assert.equal(manifest.collisions.length, 0);
  assert.ok(manifest.projects.some(p => p.group === 'lab-ops/specimen' && p.name === 'accessioning-service'));
});

// ---- the write gate

const clean = {root: 'akiv', operations: [{op: 'create-group', path: 'akiv/patients'}]};

test('accepts a plan that only creates', () => {
  const result = validatePlan(clean);
  assert.ok(result.ok, result.errors.join('; '));
  assert.equal(result.operationCount, 1);
});

test('rejects every destructive operation by name', () => {
  for (const op of ['delete-project', 'archive-group', 'transfer-project', 'rename-group', 'purge-repo']) {
    const result = validatePlan({root: 'akiv', operations: [{op, path: 'akiv/patients/x'}]});
    assert.equal(result.ok, false, `${op} must be rejected`);
    assert.match(result.errors.join('\n'), /require separate authorization/);
  }
});

test('rejects an unknown operation without calling it destructive', () => {
  const result = validatePlan({root: 'akiv', operations: [{op: 'mirror-project', path: 'akiv/x'}]});
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /Unknown operation/);
});

test('refuses to create at instance top level', () => {
  const result = validatePlan({operations: [{op: 'create-group', path: 'patients'}]});
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /root namespace is required/);
});

test('rejects illegal and reserved path segments', () => {
  assert.match(validatePlan({root: 'akiv', operations: [{op: 'create-group', path: 'akiv/-bad'}]}).errors.join('\n'), /illegal path segment/);
  assert.match(validatePlan({root: 'akiv', operations: [{op: 'create-project', path: 'akiv/api/x'}]}).errors.join('\n'), /reserved GitLab path segment/);
});

test('rejects a duplicate operation on the same target', () => {
  const result = validatePlan({root: 'akiv', operations: [clean.operations[0], clean.operations[0]]});
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /Duplicate operation/);
});

test('rejects an empty plan', () => {
  assert.equal(validatePlan({root: 'akiv', operations: []}).ok, false);
});

test('the allowed operations never include a destructive verb', () => {
  for (const op of ALLOWED_OPERATIONS) assert.doesNotMatch(op, /delete|remove|archive|transfer|rename|purge/);
});

// ---- credentials

import {authHeader, resolveCredential, describeAuthFailure, SCHEMES} from '../scripts/auth.mjs';

test('carries each credential type on the header GitLab expects', () => {
  assert.deepEqual(authHeader('private-token', 't'), {'PRIVATE-TOKEN': 't'});
  assert.deepEqual(authHeader(undefined, 't'), {'PRIVATE-TOKEN': 't'});
  assert.deepEqual(authHeader('bearer', 't'), {Authorization: 'Bearer t'});
  assert.deepEqual(authHeader('oauth', 't'), {Authorization: 'Bearer t'});
  assert.deepEqual(authHeader('job-token', 't'), {'JOB-TOKEN': 't'});
});

test('rejects a deploy token instead of failing later with an opaque 401', () => {
  assert.throws(() => authHeader('deploy-token', 't'), /Deploy tokens cannot be used/);
});

test('rejects an unknown scheme and a missing credential', () => {
  assert.throws(() => authHeader('magic', 't'), /Unknown auth scheme/);
  assert.throws(() => authHeader('bearer', ''), /No credential supplied/);
});

test('prefers the product token, falls back to a CI job token', () => {
  assert.deepEqual(resolveCredential({env: {AWFD_GITLAB_TOKEN: 'a'}}), {token: 'a', scheme: 'private-token'});
  assert.deepEqual(resolveCredential({env: {CI_JOB_TOKEN: 'c'}}), {token: 'c', scheme: 'job-token'});
  assert.deepEqual(resolveCredential({env: {AWFD_GITLAB_TOKEN: 'a', CI_JOB_TOKEN: 'c'}}), {token: 'a', scheme: 'private-token'});
  assert.equal(resolveCredential({flag: 'bearer', env: {AWFD_GITLAB_TOKEN: 'a'}}).scheme, 'bearer');
  assert.equal(resolveCredential({env: {AWFD_GITLAB_TOKEN: 'a', AWFD_GITLAB_AUTH: 'bearer'}}).scheme, 'bearer');
  assert.equal(resolveCredential({env: {}}).token, undefined);
});

test('explains 401 and 403 rather than dumping the response', () => {
  assert.match(describeAuthFailure(401, 'bearer', 'GET', '/groups/x'), /expired.*two hours/s);
  assert.match(describeAuthFailure(403, 'private-token', 'POST', '/groups'), /`api` scope and at least Maintainer/);
  assert.equal(describeAuthFailure(404, 'private-token', 'GET', '/groups/x'), null);
  assert.equal(describeAuthFailure(500, 'private-token', 'GET', '/groups/x'), null);
});

test('no auth failure message can leak a credential', () => {
  for (const scheme of SCHEMES) {
    for (const status of [401, 403]) {
      assert.doesNotMatch(describeAuthFailure(status, scheme, 'GET', '/x'), /glpat-|secret-token-value/);
    }
  }
});
