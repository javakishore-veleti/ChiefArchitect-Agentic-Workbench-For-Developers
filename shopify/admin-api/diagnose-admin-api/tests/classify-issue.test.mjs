import test from 'node:test'; import assert from 'node:assert/strict'; import {execFileSync} from 'node:child_process';
const run=text=>JSON.parse(execFileSync(process.execPath,[new URL('../scripts/classify-issue.mjs',import.meta.url).pathname,text],{encoding:'utf8'}));
test('routes permission failure',()=>assert.equal(run('ACCESS DENIED due to missing scope').matches[0].id,'access-and-permissions'));
test('routes throttling',()=>assert.equal(run('429 throttled query cost bucket').matches[0].id,'query-cost-and-throttling'));
test('routes version regression',()=>assert.equal(run('field null after upgrade version').matches[0].id,'api-version-and-schema'));
