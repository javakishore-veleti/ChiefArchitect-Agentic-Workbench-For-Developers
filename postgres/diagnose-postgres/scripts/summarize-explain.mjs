#!/usr/bin/env node
import fs from 'node:fs';

export function summarizeExplain(document) {
  const root = Array.isArray(document) ? document[0] : document;
  const plan = root?.Plan ?? root;
  if (!plan || typeof plan !== 'object' || typeof plan['Node Type'] !== 'string') throw new Error('Expected PostgreSQL EXPLAIN JSON');
  const findings = [];
  const nodes = [];
  walk(plan, 'Plan', nodes, findings);
  return {
    planningTimeMs: root?.['Planning Time'] ?? null,
    executionTimeMs: root?.['Execution Time'] ?? null,
    nodeCount: nodes.length,
    nodes,
    findings
  };
}

function walk(node, path, nodes, findings) {
  const type = node['Node Type'] ?? 'Unknown';
  const loops = number(node['Actual Loops'], 1);
  const estimated = number(node['Plan Rows'], null);
  const actualPerLoop = number(node['Actual Rows'], null);
  const actual = actualPerLoop === null ? null : actualPerLoop * loops;
  const summary = { path, type, relation: node['Relation Name'] ?? null, estimatedRows: estimated, actualRows: actual, loops };
  nodes.push(summary);

  if (estimated !== null && actual !== null) {
    const ratio = actual === 0 || estimated === 0 ? (actual === estimated ? 1 : Infinity) : Math.max(actual / estimated, estimated / actual);
    if (ratio >= 10) findings.push({ severity: ratio >= 100 ? 'high' : 'medium', code: 'cardinality-mismatch', path, ratio: Number.isFinite(ratio) ? round(ratio) : null });
  }
  const tempBlocks = number(node['Temp Read Blocks'], 0) + number(node['Temp Written Blocks'], 0);
  if (tempBlocks > 0 || /external/i.test(node['Sort Method'] ?? '') || number(node['Hash Batches'], 1) > 1) {
    findings.push({ severity: 'medium', code: 'temp-spill', path, tempBlocks, sortMethod: node['Sort Method'] ?? null, hashBatches: node['Hash Batches'] ?? null });
  }
  const planned = number(node['Workers Planned'], 0);
  const launched = number(node['Workers Launched'], planned);
  if (planned > launched) findings.push({ severity: 'medium', code: 'parallel-worker-shortfall', path, planned, launched });
  if (type === 'Index Only Scan' && number(node['Heap Fetches'], 0) > 0) findings.push({ severity: 'low', code: 'index-only-heap-fetches', path, heapFetches: node['Heap Fetches'] });
  for (const [index, child] of (node.Plans ?? []).entries()) walk(child, `${path}.Plans[${index}]`, nodes, findings);
}

function number(value, fallback) { return typeof value === 'number' && Number.isFinite(value) ? value : fallback; }
function round(value) { return Math.round(value * 100) / 100; }

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const input = process.argv[2] ? fs.readFileSync(process.argv[2], 'utf8') : fs.readFileSync(0, 'utf8');
  process.stdout.write(`${JSON.stringify(summarizeExplain(JSON.parse(input)), null, 2)}\n`);
}
