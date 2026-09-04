import test from 'node:test';import assert from 'node:assert/strict';import {classify} from '../scripts/classify-issue.mjs';
test('routes resource-specific cart issue',()=>assert.deepEqual(classify('cart buyer identity is lost'),{kind:'domain',route:'carts',reason:'resource-specific'}));
test('routes cross-cutting token issue',()=>assert.equal(classify('401 from Storefront token').route,'auth-access'));
test('routes market without a resource',()=>assert.equal(classify('wrong currency for @inContext country').route,'context-localization'));
test('uses safe response default',()=>assert.equal(classify('unexpected result').route,'response-errors'));

