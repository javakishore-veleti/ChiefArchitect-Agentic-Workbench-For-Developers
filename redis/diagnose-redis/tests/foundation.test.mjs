import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {classifyIssue} from '../scripts/classify-issue.mjs';
import {validateCommandPlan} from '../scripts/validate-command-plan.mjs';
import {compareContexts} from '../scripts/compare-contexts.mjs';
import {resolveConfig} from '../../shared/config/resolve-config.mjs';
import {resolveKeyTerm} from '../../shared/key-vocabulary/resolve-key-term.mjs';
import {mergeConfig,readConfigUri} from '../../shared/config/load-config.mjs';

test('classifies cluster symptoms without loading evidence',()=>assert.equal(classifyIssue('Jedis CROSSSLOT after MOVED').selected,'cluster-replication-persistence'));
test('allows bounded read diagnostics',()=>assert.equal(validateCommandPlan({commands:['TYPE exact:key','SCAN 0 MATCH prefix:* COUNT 50']}).ok,true));
test('blocks dangerous and unbounded commands',()=>assert.equal(validateCommandPlan({commands:['KEYS *','SCAN 0','SCAN 0 MATCH * COUNT 10','FLUSHALL']}).errors.length,4));
test('blocks production mutations despite mutation flag',()=>assert.equal(validateCommandPlan({commands:['SET a b'],production:true,allowMutation:true}).ok,false));
test('context comparison omits secret material',()=>assert.deepEqual(compareContexts({port:6379,password:'a'},{port:6380,password:'b'}),[{field:'port',left:6379,right:6380}]));
test('resolves arbitrary environment and named deployment',()=>{
  const doc=JSON.parse(fs.readFileSync(new URL('../../shared/config/redis-config.example.json',import.meta.url)));
  assert.equal(resolveConfig(doc,{environment:'qa',deploymentName:'catalog-primary'}).deployment.provider,'azure');
});
test('resolves a business term to an exact bounded key',()=>{
  const vocab=JSON.parse(fs.readFileSync(new URL('../../shared/key-vocabulary/key-vocabulary.example.json',import.meta.url)));
  assert.equal(resolveKeyTerm(vocab,'catalog cache',{environment:'qa','product-id':'P1'}).key,'catalog:qa:product:P1');
});
test('fails on missing parameters and wildcard values',()=>{
  const vocab={terms:[{term:'thing','key-template':'x:{id}','allowed-operations':['TYPE']}]};
  assert.throws(()=>resolveKeyTerm(vocab,'thing',{}),/Missing/);
  assert.throws(()=>resolveKeyTerm(vocab,'thing',{id:'*'}),/unsafe/);
});
test('override replaces a complete named config',()=>{
  const base={'configs-envs-mapping':[{'config-name':'a',envs:['dev']}],configs:[{'config-name':'a',deployments:[{name:'old'}]}]};
  const override={'configs-envs-mapping':[{'config-name':'a',envs:['qa']}],configs:[{'config-name':'a',deployments:[{name:'new'}]}]};
  assert.equal(mergeConfig(base,override).configs[0].deployments[0].name,'new');
});
test('S3 override uses runtime identity through the AWS CLI',async()=>{
  const calls=[]; const result=await readConfigUri('s3://bucket/config.json',{run:async(cmd,args)=>{calls.push([cmd,args]); return {stdout:'{"configs":[]}'};}});
  assert.deepEqual(result,{configs:[]}); assert.equal(calls[0][0],'aws');
});
