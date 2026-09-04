import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

test('all harness adapters resolve to canonical skills',()=>{
  const result=spawnSync(process.execPath,['scripts/validate-harness-skills.mjs'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/Validated 15 skills across 3 discovery catalogs/);
});
