#!/usr/bin/env node
import fs from 'node:fs';
const [leftPath,rightPath]=process.argv.slice(2);if(!leftPath||!rightPath){console.error('Usage: compare-products.mjs <left.json> <right.json>');process.exit(2);}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const norm=x=>{const p=x.data?.product??x.product??x;return {handle:p.handle??null,title:p.title??null,status:p.status??null,variants:(p.variants?.nodes??p.variants??[]).map(v=>({sku:v.sku??null,title:v.title??null,options:v.selectedOptions??[]})).sort((a,b)=>(a.sku??a.title??'').localeCompare(b.sku??b.title??''))};};
const left=norm(read(leftPath)),right=norm(read(rightPath));
const differences=[];for(const k of ['handle','title','status'])if(JSON.stringify(left[k])!==JSON.stringify(right[k]))differences.push({field:k,left:left[k],right:right[k]});
if(JSON.stringify(left.variants)!==JSON.stringify(right.variants))differences.push({field:'variants',left:left.variants,right:right.variants});
console.log(JSON.stringify({equal:differences.length===0,differences},null,2));process.exit(differences.length?1:0);
