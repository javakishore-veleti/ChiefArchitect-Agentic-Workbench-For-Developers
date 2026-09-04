import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {resolveMetafieldTerm,validateVocabulary} from '../metafields/resolve-metafield-term.mjs';import {buildMetafieldQuery} from '../metafields/build-metafield-query.mjs';
const doc=JSON.parse(fs.readFileSync(new URL('../metafields/metafield-vocabulary.example.json',import.meta.url)));
test('template validates',()=>assert.deepEqual(validateVocabulary(doc),[]));
test('resolves normalized alias',()=>assert.deepEqual(resolveMetafieldTerm(doc,{term:'Product-Source ID'}),{term:'external product id','owner-type':'PRODUCT',namespace:'integration',key:'external_product_id',type:'single_line_text_field'}));
test('builds owner-specific read query',()=>{const x=buildMetafieldQuery(resolveMetafieldTerm(doc,{term:'source order id'}));assert.match(x.query,/\.\.\. on Order/);assert.deepEqual(x.variables,{namespace:'integration',key:'source_order_id'})});
test('unknown term fails closed',()=>assert.throws(()=>resolveMetafieldTerm(doc,{term:'not configured'}),/No metafield mapping/));
test('duplicate alias is rejected',()=>{const x=structuredClone(doc);x.terms[1].aliases.push('customer source id');assert.match(validateVocabulary(x).join(';'),/duplicate phrase/)});
