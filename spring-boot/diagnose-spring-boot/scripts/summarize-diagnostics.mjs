#!/usr/bin/env node
const sensitive=/(authorization|cookie|set-cookie|password|secret|token|credential|private[-_ ]?key|client[-_ ]?secret)/i;
const valueSecrets=/(bearer\s+[\w.-]+|(?:password|secret|token)=([^\s&,;]+))/ig;
export function redact(value,key='') {
  if(sensitive.test(key)) return '[REDACTED]';
  if(Array.isArray(value)) return value.map(v=>redact(v));
  if(value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,redact(v,k)]));
  return typeof value==='string'?value.replace(valueSecrets,'[REDACTED]'):value;
}
export function summarize(input){const safe=redact(input); return {context:safe.context??null, observations:safe.observations??[], likelyLayer:safe.likelyLayer??'undetermined', confidence:safe.confidence??'low', excludedCauses:safe.excludedCauses??[], nextSafeProbe:safe.nextSafeProbe??null};}
if(import.meta.url===`file://${process.argv[1]}`) console.log(JSON.stringify(summarize(JSON.parse(process.argv[2]||'{}')),null,2));
