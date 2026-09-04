import test from 'node:test'; import assert from 'node:assert/strict'; import {spawnSync} from 'node:child_process';
const run=(s)=>spawnSync(process.execPath,['scripts/classify-issue.mjs',s],{cwd:new URL('..',import.meta.url),encoding:'utf8'});
test('routes runner',()=>assert.equal(JSON.parse(run('self hosted runner queued').stdout).route,'runner'));
test('routes artifact',()=>assert.equal(JSON.parse(run('artifact upload digest mismatch').stdout).route,'artifact'));
test('fails ambiguity',()=>assert.equal(run('runner cache failure').status,2));
test('fails unknown',()=>assert.equal(run('something odd').status,2));
