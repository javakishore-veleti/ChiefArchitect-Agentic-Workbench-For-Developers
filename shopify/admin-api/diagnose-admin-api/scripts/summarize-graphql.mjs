#!/usr/bin/env node
import fs from 'node:fs'; const file=process.argv[2]; if(!file){console.error('Usage: summarize-graphql.mjs RESPONSE.json');process.exit(2)}
const x=JSON.parse(fs.readFileSync(file)); const userErrors=[];
const visit=(v,p=[])=>{if(!v||typeof v!=='object')return;if(Array.isArray(v)){v.forEach((n,i)=>visit(n,[...p,i]));return}for(const[k,n]of Object.entries(v)){if(k==='userErrors'&&Array.isArray(n))n.forEach(e=>userErrors.push({path:[...p,k],field:e.field??null,message:e.message??'',code:e.code??null}));visit(n,[...p,k])}}; visit(x.data);
console.log(JSON.stringify({httpStatus:x.httpStatus??null,requestId:x.requestId??null,topLevelErrors:x.errors??[],userErrors,cost:x.cost??x.extensions?.cost??null},null,2));
