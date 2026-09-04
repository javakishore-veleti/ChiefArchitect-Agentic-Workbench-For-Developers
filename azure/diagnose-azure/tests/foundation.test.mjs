import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {classify} from '../scripts/classify-azure-issue.mjs';
import {validate} from '../scripts/validate-diagnostic-plan.mjs';
import {redact} from '../scripts/redact-evidence.mjs';
import {resolveContext} from '../../shared/config/resolve-context.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const example=JSON.parse(fs.readFileSync(path.join(here,'../../shared/config/azure-config.example.json'),'utf8'));

test('routes an ACR pull failure without loading all skills',()=>assert.equal(classify('AKS ImagePullBackOff from ACR').route,'acr'));
test('enhanced routes load local patterns',()=>{
  for(const sample of ['AKS ingress TLS failure','Key Vault access denied','Entra OAuth authorization','Cosmos 429','Redis memory pressure','Application Insights telemetry gap']){
    const result=classify(sample);
    assert.equal(result.status,'matched');
    assert.match(result.skill,/\.md$/);
    assert.doesNotMatch(result.skill,/SKILL\.md$/);
    assert.ok(fs.existsSync(path.join(here,'../patterns',result.skill)));
  }
});
test('asks for clarification when no Azure symptom exists',()=>assert.equal(classify('something failed').status,'needs-clarification'));
test('resolves dynamic environment and resource identity',()=>{
  const c=resolveContext(example,{environment:'qa',application:'service-a',resource:'runtime'});
  assert.equal(c.subscription.alias,'portfolio-nonprod');
  assert.equal(c.resource.name,'runtime');
  assert.match(c.resource.id,/aks-qa$/);
});
test('rejects ambiguous application-free scope',()=>assert.throws(()=>resolveContext(example,{environment:'qa'}),/application or resource/));
test('allows scoped read-only metadata query',()=>assert.equal(validate([{command:'az resource show --ids /subscriptions/x/resourceGroups/y/providers/z','subscription':'x'}]).allowed,true));
test('blocks secret-value retrieval',()=>assert.equal(validate([{command:'az keyvault secret show --vault-name v --name n','subscription':'x'}]).allowed,false));
test('blocks kubernetes mutation',()=>assert.equal(validate([{command:'kubectl rollout restart deployment/api'}]).allowed,false));
test('redacts secrets, JWTs, and signed query values',()=>{
  const x=redact({clientSecret:'bad',url:'https://x/?sig=bad',note:'eyJabc.def.ghi'});
  assert.equal(x.clientSecret,'[REDACTED]');assert.match(x.url,/\[REDACTED\]/);assert.equal(x.note,'[REDACTED_TOKEN]');
});
