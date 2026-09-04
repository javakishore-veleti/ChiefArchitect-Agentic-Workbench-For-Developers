import test from 'node:test';import assert from 'node:assert/strict';import {summarize} from '../scripts/summarize-response.mjs';import {compare,normalize} from '../scripts/compare-responses.mjs';
test('summarizes partial GraphQL response and nested errors',()=>{const s=summarize({httpStatus:200,errors:[{message:'partial'}],data:{cartCreate:{userErrors:[{field:['input'],message:'bad',code:'INVALID'}],warnings:[{message:'warn',code:'NOTICE'}]}},extensions:{cost:{throttleStatus:{currentlyAvailable:99}}}});assert.equal(s.topLevelErrors.length,1);assert.equal(s.userErrors[0].code,'INVALID');assert.equal(s.warnings[0].code,'NOTICE');assert.equal(s.throttle.currentlyAvailable,99)});
test('marks non-json response invalid',()=>assert.equal(summarize({httpStatus:200,nonJson:'<html>'}).validJson,false));
test('comparison ignores volatile IDs and duration',()=>assert.equal(compare({apiVersion:'a',durationMs:1,data:{id:'x',name:'A'}},{apiVersion:'a',durationMs:9,data:{id:'y',name:'A'}}).equal,true));
test('normalization retains business values',()=>assert.equal(normalize({id:'x',name:'A'}).name,'A'));

