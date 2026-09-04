#!/usr/bin/env node
import {redact} from './summarize-diagnostics.mjs';
export function compare(a,b){if(a.service!==b.service) throw new Error('Contexts must identify the same service'); if(a.probe!==b.probe) throw new Error('Contexts must use the same probe'); const keys=[...new Set([...Object.keys(a.result||{}),...Object.keys(b.result||{})])]; return {service:a.service,probe:a.probe,differences:keys.filter(k=>JSON.stringify(a.result?.[k])!==JSON.stringify(b.result?.[k])).map(k=>({field:k,left:redact(a.result?.[k],k),right:redact(b.result?.[k],k)}))};}
if(import.meta.url===`file://${process.argv[1]}`) console.log(JSON.stringify(compare(JSON.parse(process.argv[2]),JSON.parse(process.argv[3])),null,2));
