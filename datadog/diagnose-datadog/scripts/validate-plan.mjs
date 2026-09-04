#!/usr/bin/env node
let input=''; for await (const chunk of process.stdin) input+=chunk;
const blocked=[/\b(POST|PUT|PATCH|DELETE)\b/i,/create[_ -]?(monitor|downtime|incident)/i,/update[_ -]?(monitor|incident|dashboard|slo)/i,/delete[_ -]/i,/rotate/i,/revoke/i,/remediat/i,/unrestricted|all[- ]time|no[- ]limit/i,/api[-_ ]?key\s*[:=]/i,/app(?:lication)?[-_ ]?key\s*[:=]/i];
const reasons=blocked.filter(r=>r.test(input)).map(r=>r.source);
console.log(JSON.stringify({allowed:reasons.length===0,reasons})); if(reasons.length) process.exitCode=1;
