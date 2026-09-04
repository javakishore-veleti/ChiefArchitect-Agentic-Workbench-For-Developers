#!/usr/bin/env node
import fs from 'node:fs';
const file=process.argv[2]; if(!file){console.error('Usage: summarize-product-response.mjs <response.json>');process.exit(2);}
const body=JSON.parse(fs.readFileSync(file,'utf8'));
const userErrors=[];
function walk(v,path=[]){if(!v||typeof v!=='object')return;if(Array.isArray(v)){v.forEach((x,i)=>walk(x,[...path,i]));return;}for(const[k,x]of Object.entries(v)){if(k==='userErrors'&&Array.isArray(x))for(const e of x)userErrors.push({path:path.join('.'),field:e.field??null,code:e.code??null,message:e.message??null});else walk(x,[...path,k]);}}
walk(body.data);
const cost=body.extensions?.cost;
const out={ok:!(body.errors?.length||userErrors.length),graphqlErrors:(body.errors??[]).map(e=>({message:e.message,path:e.path??null,code:e.extensions?.code??null})),userErrors,cost:cost?{requested:cost.requestedQueryCost,actual:cost.actualQueryCost,available:cost.throttleStatus?.currentlyAvailable}:null};
console.log(JSON.stringify(out,null,2));
process.exit(out.ok?0:1);
