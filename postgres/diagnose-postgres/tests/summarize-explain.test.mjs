import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeExplain } from '../scripts/summarize-explain.mjs';

test('reports cardinality, spill, worker and visibility evidence', () => {
  const result = summarizeExplain([{ 'Planning Time': 2, 'Execution Time': 40, Plan: {
    'Node Type': 'Gather', 'Plan Rows': 10, 'Actual Rows': 1000, 'Actual Loops': 1,
    'Workers Planned': 4, 'Workers Launched': 2,
    Plans: [{ 'Node Type': 'Index Only Scan', 'Relation Name': 'orders', 'Plan Rows': 10,
      'Actual Rows': 5, 'Actual Loops': 3, 'Heap Fetches': 8, 'Temp Written Blocks': 4 }]
  }}]);
  assert.equal(result.nodeCount, 2);
  assert.equal(result.nodes[1].actualRows, 15);
  assert.deepEqual(new Set(result.findings.map(x => x.code)), new Set([
    'cardinality-mismatch', 'parallel-worker-shortfall', 'temp-spill', 'index-only-heap-fetches'
  ]));
});

test('accepts a bare plan and rejects unrelated JSON', () => {
  assert.equal(summarizeExplain({ 'Node Type': 'Seq Scan', 'Plan Rows': 1 }).nodeCount, 1);
  assert.throws(() => summarizeExplain({}), /Expected PostgreSQL EXPLAIN JSON/);
});

