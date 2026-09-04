#!/usr/bin/env node
const sensitiveKey=/(secret|token|password|credential|client.?secret|connection.?string|authorization|patient|member|ssn)/i;
const jwt=/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
export function redact(value,key=''){
  if(sensitiveKey.test(key))return '[REDACTED]';
  if(typeof value==='string')return value.replace(jwt,'[REDACTED_TOKEN]').replace(/([?&](?:sig|token|code)=)[^&\s]+/gi,'$1[REDACTED]');
  if(Array.isArray(value))return value.map(v=>redact(v));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,redact(v,k)]));
  return value;
}
if(import.meta.url===`file://${process.argv[1]}`){let raw='';for await(const c of process.stdin)raw+=c;console.log(JSON.stringify(redact(JSON.parse(raw)),null,2));}
