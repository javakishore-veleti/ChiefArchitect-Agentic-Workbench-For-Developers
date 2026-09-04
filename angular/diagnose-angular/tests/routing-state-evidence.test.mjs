import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const file = new URL('../knowledge/routing-state.jsonl', import.meta.url);
const records = (await readFile(file, 'utf8')).trim().split('\n').map(JSON.parse);
const start = '2024-09-04';
const end = '2026-09-04';

test('contains a compact set of distinct, in-window public records', () => {
  assert.ok(records.length >= 12 && records.length <= 18);
  assert.equal(new Set(records.map(({id}) => id)).size, records.length);
  assert.equal(new Set(records.map(({url}) => url)).size, records.length);
  for (const record of records) {
    assert.match(record.url, /^https:\/\/github\.com\/(angular\/angular|ngrx\/platform)\/issues\/\d+$/);
    assert.ok(record.opened >= start && record.opened <= end, `${record.id} outside evidence window`);
    assert.ok(record.symptom && record.checkpoint && record.evidence);
  }
});

test('separates framework evidence from state-library evidence', () => {
  const kinds = new Set(records.map(({sourceKind, ['source-kind']: source_kind}) => sourceKind ?? source_kind));
  assert.ok([...kinds].some((kind) => kind.startsWith('framework-')));
  assert.ok([...kinds].some((kind) => kind.startsWith('library-')));
  assert.ok(records.some(({source}) => source === 'ngrx/platform'));
  assert.ok(records.some(({area}) => area === 'routing'));
  assert.ok(records.some(({area}) => area === 'state'));
});

test('does not promote proposals or weak reports to confirmed defects', () => {
  for (const record of records) {
    if (['proposal', 'rfc', 'needs-reproduction'].includes(record.evidence)) {
      assert.doesNotMatch(record.checkpoint, /confirmed (bug|defect)/i);
    }
  }
});
