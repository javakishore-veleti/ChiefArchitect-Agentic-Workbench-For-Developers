#!/usr/bin/env node
import fs from 'node:fs';

const normalize=value=>String(value??'').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

export function validateVocabulary(doc){
  const errors=[];
  if(doc?.['schema-version']!==1)errors.push('schema-version must be 1');
  if(!Array.isArray(doc?.terms))return [...errors,'terms must be an array'];
  const phrases=new Map();
  for(const [i,item] of doc.terms.entries()){
    const label='terms['+i+']';
    for(const field of ['term','owner-type','namespace','key'])if(!item?.[field])errors.push(label+' requires '+field);
    for(const phrase of [item?.term,...(item?.aliases||[])].filter(Boolean)){
      const key=normalize(phrase);
      if(!key)errors.push(label+' contains an empty phrase');
      else if(phrases.has(key))errors.push('duplicate phrase: '+phrase);
      else phrases.set(key,item);
    }
  }
  return errors;
}

export function resolveMetafieldTerm(doc,{term,ownerType}={}){
  const errors=validateVocabulary(doc);if(errors.length)throw new Error('Invalid vocabulary: '+errors.join('; '));
  const wanted=normalize(term);if(!wanted)throw new Error('term is required');
  const matches=doc.terms.filter(item=>[item.term,...(item.aliases||[])].some(x=>normalize(x)===wanted)).filter(item=>!ownerType||item['owner-type']===ownerType);
  if(matches.length===0)throw new Error('No metafield mapping for term'+(ownerType?' and owner type '+ownerType:''));
  if(matches.length>1)throw new Error('Ambiguous metafield term; supply owner type');
  const item=matches[0];return {term:item.term,'owner-type':item['owner-type'],namespace:item.namespace,key:item.key,type:item.type??null};
}

if(import.meta.url===new URL('file://'+process.argv[1]).href){
  const args=process.argv.slice(2),get=n=>{const i=args.indexOf(n);return i<0?undefined:args[i+1]};
  const file=get('--vocabulary')||process.env.SHOPIFY_METAFIELD_VOCABULARY_PATH;
  if(!file){console.error('Required: --vocabulary FILE or SHOPIFY_METAFIELD_VOCABULARY_PATH');process.exit(2)}
  try{console.log(JSON.stringify(resolveMetafieldTerm(JSON.parse(fs.readFileSync(file)),{term:get('--term'),ownerType:get('--owner-type')}),null,2))}catch(e){console.error(e.message);process.exit(1)}
}
