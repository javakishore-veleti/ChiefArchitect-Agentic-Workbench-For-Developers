#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const discovery=['.agents/skills','.claude/skills','.github/skills'];
const expected=fs.readdirSync(path.join(root,'.github/skills'),{withFileTypes:true})
  .filter(x=>x.isDirectory()).map(x=>x.name).sort();
const errors=[];

for(const base of discovery){
  const dir=path.join(root,base);
  const actual=fs.readdirSync(dir,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name).sort();
  if(JSON.stringify(actual)!==JSON.stringify(expected))errors.push(`${base} catalog differs from .github/skills`);
  for(const name of expected){
    const file=path.join(dir,name,'SKILL.md');
    if(!fs.existsSync(file)){errors.push(`missing ${path.relative(root,file)}`);continue;}
    const text=fs.readFileSync(file,'utf8');
    if(!text.startsWith('---\n')||!text.includes(`name: ${name}\n`)||!text.includes('\ndescription:'))errors.push(`invalid frontmatter in ${path.relative(root,file)}`);
    const matches=[...text.matchAll(/`((?:angular|azure|databricks|datadog|github-actions|gitlab|postgres|redis|shopify|spring-boot)\/[^`]+\/SKILL\.md)`/g)];
    if(matches.length!==1)errors.push(`expected one canonical target in ${path.relative(root,file)}`);
    else if(!fs.existsSync(path.join(root,matches[0][1])))errors.push(`broken canonical target ${matches[0][1]}`);
  }
}

if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Validated ${expected.length} skills across ${discovery.length} discovery catalogs.`);
