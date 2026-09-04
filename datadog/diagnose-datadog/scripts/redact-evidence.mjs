#!/usr/bin/env node
let input=''; for await (const chunk of process.stdin) input+=chunk;
const sensitive=/api[-_ ]?key|app(?:lication)?[-_ ]?key|token|authorization|password|secret|cookie|session[-_ ]?id|email|patient|ssn/i;
function clean(v,key=''){ if(sensitive.test(key)) return '[REDACTED]'; if(Array.isArray(v)) return v.map(x=>clean(x)); if(v&&typeof v==='object') return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clean(x,k)])); if(typeof v==='string') return v.replace(/(bearer\s+)[\w.\-]+/ig,'$1[REDACTED]').replace(/([?&](?:api_key|application_key|token)=)[^&\s]+/ig,'$1[REDACTED]'); return v; }
try { console.log(JSON.stringify(clean(JSON.parse(input)),null,2)); } catch { console.log(input.replace(/(bearer\s+)[\w.\-]+/ig,'$1[REDACTED]')); }
