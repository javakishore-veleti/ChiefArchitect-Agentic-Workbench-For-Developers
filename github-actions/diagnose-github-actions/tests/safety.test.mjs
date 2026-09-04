import test from 'node:test'; import assert from 'node:assert/strict'; import {spawnSync} from 'node:child_process'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const root=new URL('..',import.meta.url); const tmp=(x)=>{const p=path.join(os.tmpdir(),`gha-${crypto.randomUUID()}`);fs.writeFileSync(p,x);return p};
test('allows read plan',()=>assert.equal(spawnSync(process.execPath,['scripts/validate-plan.mjs',tmp('{"actions":["inspect run logs"]}')],{cwd:root}).status,0));
test('blocks dispatch and deploy',()=>assert.equal(spawnSync(process.execPath,['scripts/validate-plan.mjs',tmp('{"actions":["dispatch production deploy"]}')],{cwd:root}).status,2));
test('flags mutable action',()=>assert.equal(spawnSync(process.execPath,['scripts/validate-workflow.mjs',tmp('steps:\n- uses: actions/checkout@v4')],{cwd:root}).status,2));
test('accepts pinned action',()=>assert.equal(spawnSync(process.execPath,['scripts/validate-workflow.mjs',tmp('permissions:\n  contents: read\nsteps:\n- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683')],{cwd:root}).status,0));
test('redacts tokens',()=>{const p=tmp('Authorization: Bearer abcdefghijk token=ghp_abcdefghijklmnopqrstuvwxyz');const r=spawnSync(process.execPath,['scripts/redact.mjs',p],{cwd:root,encoding:'utf8'});assert(!r.stdout.includes('abcdefghijk'));assert(!r.stdout.includes('ghp_'))});
