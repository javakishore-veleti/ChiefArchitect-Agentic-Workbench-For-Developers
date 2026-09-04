import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const evidenceUrl = new URL('../knowledge/observability-runtime.jsonl', import.meta.url);
const start = '2024-09-04';
const end = '2026-09-04';

async function records() {
  const text = await readFile(evidenceUrl, 'utf8');
  return text.trim().split('\n').map((line) => JSON.parse(line));
}

test('observability and runtime evidence is distinct, bounded, and official', async () => {
  const items = await records();
  assert.ok(items.length >= 15 && items.length <= 20);
  assert.equal(new Set(items.map(({ url }) => url)).size, items.length);
  assert.equal(new Set(items.map(({ id }) => id)).size, items.length);
  for (const item of items) {
    assert.ok(item.date >= start && item.date <= end, `${item.id}: date outside window`);
    assert.equal(item.issue, Number(new URL(item.url).pathname.split('/').at(-1)));
    assert.match(item.url, /^https:\/\/github\.com\/(spring-projects\/(spring-boot|spring-framework)|micrometer-metrics\/micrometer)\/issues\/\d+$/);
    assert.match(item.docs, /^https:\/\/docs\.(spring\.io|micrometer\.io)\//);
    for (const field of ['id', 'repo', 'status', 'version', 'area', 'symptom', 'checkpoint']) {
      assert.ok(item[field], `${item.id}: missing ${field}`);
    }
  }
});

test('catalog separates actuator, telemetry, lifecycle, and native concerns', async () => {
  const areas = (await records()).map(({ area }) => area).join(' ');
  for (const term of ['health', 'readiness', 'logging', 'metrics', 'observation', 'tracing', 'kubernetes', 'shutdown', 'native', 'aot']) {
    assert.ok(areas.includes(term), `missing ${term}`);
  }
});

test('platform reports retain attribution boundaries', async () => {
  const items = await records();
  const platform = items.filter(({ area }) => /kubernetes|native|otel/.test(area));
  assert.ok(platform.length >= 7);
  assert.ok(platform.every(({ checkpoint }) => /distinguish|separate|compare|confirm|identify|inspect|reproduce|infer|ownership|layer/i.test(checkpoint)));
});
