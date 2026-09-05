#!/usr/bin/env node
// Validate every SKILL.md against the Agent Skills specification.
// https://agentskills.io/specification
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const skip=new Set(['.git','node_modules','dist','packages']);
const NAME=/^[a-z0-9]+(-[a-z0-9]+)*$/;
const NAME_MAX=64;
const DESCRIPTION_MAX=1024;
const BODY_MAX_LINES=500;

export function discover(base=root){
  const found=[];
  (function walk(dir){
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
      if(skip.has(entry.name))continue;
      const target=path.join(dir,entry.name);
      if(entry.isDirectory())walk(target);
      else if(entry.name==='SKILL.md')found.push(target);
    }
  })(base);
  return found.sort();
}

export function validateSkill(file,base=root){
  const rel=path.relative(base,file);
  const errors=[];
  const text=fs.readFileSync(file,'utf8');
  const parsed=text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if(!parsed)return [`${rel}: missing YAML frontmatter delimited by ---`];
  const [,frontmatter,body]=parsed;

  const name=(frontmatter.match(/^name:[ \t]*(.*)$/m)||[])[1]?.trim().replace(/^["']|["']$/g,'');
  const directory=path.basename(path.dirname(file));
  if(!name)errors.push(`${rel}: frontmatter requires a name`);
  else{
    if(!NAME.test(name))errors.push(`${rel}: name "${name}" must be lowercase a-z0-9 separated by single hyphens, with no leading or trailing hyphen`);
    if(name.length>NAME_MAX)errors.push(`${rel}: name is ${name.length} characters; the specification allows ${NAME_MAX}`);
    if(name!==directory)errors.push(`${rel}: name "${name}" must match its parent directory "${directory}"`);
  }

  const description=(frontmatter.match(/^description:[ \t]*([\s\S]*?)(?=\n[A-Za-z][\w-]*:|$)/m)||[])[1]?.trim().replace(/^["']|["']$/g,'');
  if(!description)errors.push(`${rel}: frontmatter requires a non-empty description`);
  else if(description.length>DESCRIPTION_MAX)errors.push(`${rel}: description is ${description.length} characters; the specification allows ${DESCRIPTION_MAX}`);

  const lines=body.split('\n').length;
  if(lines>BODY_MAX_LINES)errors.push(`${rel}: body is ${lines} lines; keep SKILL.md under ${BODY_MAX_LINES} so progressive disclosure stays cheap`);

  return errors;
}

export function validateAll(base=root){
  const files=discover(base);
  return {count:files.length,errors:files.flatMap(file=>validateSkill(file,base))};
}

if(import.meta.url===`file://${process.argv[1]}`){
  const {count,errors}=validateAll();
  if(errors.length){console.error(errors.join('\n'));console.error(`\n${errors.length} specification violations across ${count} skills.`);process.exit(1);}
  console.log(`Validated ${count} skills against the Agent Skills specification.`);
}
