#!/usr/bin/env node
import fs from 'node:fs';
const index = JSON.parse(fs.readFileSync(new URL('../patterns/index.json', import.meta.url)));
export function classify(text) {
  const input = String(text).toLowerCase();
  const ranked = index.patterns.map(p => ({id:p.id, score:p.keywords.reduce((n,k)=>n+(input.includes(k)?1:0),0), matches:p.keywords.filter(k=>input.includes(k))})).filter(x=>x.score).sort((a,b)=>b.score-a.score || a.id.localeCompare(b.id));
  return {pattern:ranked[0]?.id ?? 'unclassified', ambiguous:ranked.length>1 && ranked[0].score===ranked[1].score, candidates:ranked.slice(0,3)};
}
if (import.meta.url === `file://${process.argv[1]}`) console.log(JSON.stringify(classify(process.argv.slice(2).join(' ')), null, 2));
