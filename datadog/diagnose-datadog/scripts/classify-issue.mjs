#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const index = JSON.parse(fs.readFileSync(path.join(root, 'patterns/index.json'), 'utf8'));
const text = process.argv.slice(2).join(' ').toLowerCase();
if (!text) { console.error('usage: classify-issue.mjs <symptom>'); process.exit(2); }
const ranked = index.routes.map(r => ({id:r.id,file:r.file,score:r.keywords.filter(k => text.includes(k)).length})).filter(r => r.score).sort((a,b)=>b.score-a.score || a.id.localeCompare(b.id));
console.log(JSON.stringify(ranked[0] ?? {id:'cross-signal',file:index.fallback,score:0}));
