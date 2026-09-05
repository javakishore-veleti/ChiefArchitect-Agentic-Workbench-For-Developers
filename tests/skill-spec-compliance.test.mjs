import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {validateAll, validateSkill} from '../scripts/validate-skill-spec.mjs';

function fixture(name, frontmatter, body = '# Heading\n') {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-spec-'));
  const dir = path.join(base, name);
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\n${frontmatter}\n---\n\n${body}`);
  return {base, file: path.join(dir, 'SKILL.md')};
}

test('every skill in the repository satisfies the Agent Skills specification', () => {
  const result = spawnSync(process.execPath, ['scripts/validate-skill-spec.mjs'], {encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated \d+ skills against the Agent Skills specification\./);
});

test('the repository exposes skills for the validator to check', () => {
  const {count} = validateAll();
  assert.ok(count > 0, 'discovery found no SKILL.md files');
});

test('a name that differs from its directory is rejected', () => {
  const {base, file} = fixture('diagnose-cart', 'name: shopify-diagnose-cart\ndescription: Use when a cart misbehaves.');
  assert.match(validateSkill(file, base).join('\n'), /must match its parent directory "diagnose-cart"/);
});

test('a name outside the permitted character set is rejected', () => {
  for (const name of ['Diagnose-Cart', '-diagnose', 'diagnose-', 'diagnose--cart']) {
    const {base, file} = fixture(name, `name: ${name}\ndescription: Use when a cart misbehaves.`);
    assert.match(validateSkill(file, base).join('\n'), /lowercase a-z0-9/, `expected ${name} to be rejected`);
  }
});

test('a name longer than 64 characters is rejected', () => {
  const name = 'a'.repeat(65);
  const {base, file} = fixture(name, `name: ${name}\ndescription: Use when a cart misbehaves.`);
  assert.match(validateSkill(file, base).join('\n'), /the specification allows 64/);
});

test('a missing or empty description is rejected', () => {
  const {base, file} = fixture('diagnose-cart', 'name: diagnose-cart');
  assert.match(validateSkill(file, base).join('\n'), /requires a non-empty description/);
});

test('a description longer than 1024 characters is rejected', () => {
  const {base, file} = fixture('diagnose-cart', `name: diagnose-cart\ndescription: ${'d'.repeat(1025)}`);
  assert.match(validateSkill(file, base).join('\n'), /the specification allows 1024/);
});

test('a body longer than 500 lines is rejected', () => {
  const {base, file} = fixture('diagnose-cart', 'name: diagnose-cart\ndescription: Use when a cart misbehaves.', 'line\n'.repeat(501));
  assert.match(validateSkill(file, base).join('\n'), /keep SKILL\.md under 500/);
});

test('a file without frontmatter is rejected', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-spec-'));
  const dir = path.join(base, 'diagnose-cart');
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'SKILL.md'), '# No frontmatter here\n');
  assert.match(validateSkill(path.join(dir, 'SKILL.md'), base).join('\n'), /missing YAML frontmatter/);
});

test('a fully compliant skill produces no errors', () => {
  const {base, file} = fixture('diagnose-cart', 'name: diagnose-cart\ndescription: Use when a Shopify cart loses lines or prices drift.');
  assert.deepEqual(validateSkill(file, base), []);
});
