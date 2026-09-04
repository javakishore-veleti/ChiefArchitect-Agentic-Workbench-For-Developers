import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const path = new URL('../knowledge/messaging-batch.jsonl', import.meta.url);
const records = fs.readFileSync(path, 'utf8').trim().split('\n').map((line) => JSON.parse(line));
const modules = ['spring-kafka', 'spring-amqp', 'spring-integration', 'spring-batch'];

test('contains 20 distinct official issue records', () => {
  assert.equal(records.length, 20);
  assert.equal(new Set(records.map((record) => record.id)).size, records.length);
  assert.equal(new Set(records.map((record) => record.source)).size, records.length);
  assert.ok(records.every((record) => /^https:\/\/github\.com\/spring-projects\/spring-(kafka|amqp|integration|batch)\/issues\/\d+$/.test(record.source)));
});

test('covers each messaging and batch module with five cases', () => {
  for (const module of modules) {
    assert.equal(records.filter((record) => record.module === module).length, 5, module);
  }
});

test('keeps records inside the requested two-year window', () => {
  assert.ok(records.every((record) => record['created-at'] >= '2024-09-04' && record['created-at'] <= '2026-09-04'));
});

test('retains provenance, diagnostic guidance, and evidence qualification', () => {
  for (const record of records) {
    assert.equal(record['source-type'], 'official-github-issue');
    assert.ok(record.status === 'open' || record.status === 'closed');
    assert.ok(record['evidence-level']);
    assert.ok(record.symptom.length > 30);
    assert.ok(record.diagnostic.length > 30);
    assert.match(record['official-doc'], /^https:\/\/docs\.spring\.io\//);
  }
  assert.ok(records.some((record) => record['evidence-level'] === 'invalid-report'));
  assert.ok(records.some((record) => record['evidence-level'] === 'investigation'));
});

test('patterns preserve module boundaries and restart invariants', () => {
  const messaging = fs.readFileSync(new URL('../patterns/messaging-integration.md', import.meta.url), 'utf8');
  const batch = fs.readFileSync(new URL('../patterns/batch.md', import.meta.url), 'utf8');
  for (const term of ['Spring Kafka', 'Spring AMQP', 'Spring Integration', 'publisher confirms', 'committed offset']) assert.match(messaging, new RegExp(term));
  for (const term of ['JobInstance', 'ExecutionContext', 'reader position', 'business-data commit', 'partially applied']) assert.match(batch, new RegExp(term));
});
