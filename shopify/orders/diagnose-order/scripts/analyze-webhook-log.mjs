#!/usr/bin/env node
import fs from 'node:fs';
const file=process.argv[2];if(!file){console.error('Usage: analyze-webhook-log.mjs METADATA.jsonl');process.exit(2)}
const rows=fs.readFileSync(file,'utf8').split(/\r?\n/).filter(Boolean).map((line,i)=>{try{return JSON.parse(line)}catch{throw new Error(`Invalid JSON at line ${i+1}`)}});const seen=new Map(),duplicates=[];for(const r of rows){const id=r.webhookId??r['x-shopify-webhook-id'];if(id){if(seen.has(id))duplicates.push(id);else seen.set(id,true)}}
const sorted=[...rows].sort((a,b)=>Date.parse(a.eventTime??a.createdAt??0)-Date.parse(b.eventTime??b.createdAt??0));console.log(JSON.stringify({deliveries:rows.length,uniqueWebhookIds:seen.size,duplicateWebhookIds:[...new Set(duplicates)],eventOrderChanged:sorted.some((r,i)=>r!==rows[i]),topics:[...new Set(rows.map(r=>r.topic).filter(Boolean))]},null,2));
