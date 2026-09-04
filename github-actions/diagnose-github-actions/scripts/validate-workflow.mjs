#!/usr/bin/env node
import fs from 'node:fs';
const src=fs.readFileSync(process.argv[2]||0,'utf8');
const findings=[];
if(/permissions:\s*write-all/i.test(src)) findings.push('broad write-all permission');
if(/pull_request_target[\s\S]{0,2500}ref:\s*\$\{\{\s*github\.event\.pull_request\.head/i.test(src)) findings.push('untrusted checkout under pull_request_target');
if(/(?:password|token|secret|client_secret)\s*:\s*['"]?(?!\$\{\{)[^\s'"#]{8,}/i.test(src)) findings.push('possible inline credential');
for(const m of src.matchAll(/uses:\s*([^\s]+)@([^\s#]+)/g)){const [,,ref]=m;if(!/^\.?\//.test(m[1])&&!/^[0-9a-f]{40}$/i.test(ref)) findings.push(`mutable action ref: ${m[0]}`)}
if(/id-token:\s*write/i.test(src)&&!/permissions:/i.test(src)) findings.push('OIDC permission lacks explicit permissions block');
console.log(JSON.stringify({safe:findings.length===0,findings},null,2));
if(findings.length) process.exit(2);
