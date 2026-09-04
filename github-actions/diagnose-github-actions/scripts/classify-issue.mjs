#!/usr/bin/env node
const q=process.argv.slice(2).join(' ').toLowerCase();
const rules=[['security',/attest|provenance|supply|permission|injection|secret|pin/],['oidc',/oidc|federat|environment|reviewer|audience|subject/],['reusable-workflow',/reusable|workflow_call|called workflow|composite/],['runner',/runner|queued|image|disk|ephemeral|arc/],['artifact',/artifact|cache|upload|download|retention|digest/],['deploy',/deploy|rollback|release|promotion/],['observability',/cost|minute|usage|telemetry|flaky|rerun/],['build',/build|test|matrix|compile|coverage/]];
const hits=rules.filter(([,r])=>r.test(q)).map(([x])=>x);
if(hits.length!==1) { console.error(JSON.stringify({route:null,candidates:hits,reason:hits.length?'ambiguous':'unknown'})); process.exit(2); }
console.log(JSON.stringify({route:hits[0]}));
