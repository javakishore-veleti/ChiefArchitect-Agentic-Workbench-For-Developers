#!/usr/bin/env node
import {fileURLToPath} from 'node:url';

const blocked=[
  [/\b(ng|npm|pnpm|yarn)\s+(deploy|publish)\b/i,'deployment/publish'],
  [/\b(npm|pnpm|yarn)\s+(uninstall|remove)\b/i,'dependency removal'],
  [/\bgit\s+(reset\s+--hard|clean\s+-[a-z]*f|push\s+--force|checkout\s+--)\b/i,'destructive git'],
  [/\b(delete|post|put|patch)\s+https?:\/\//i,'browser/API write'],
  [/\b(print|show|dump|echo|cat)\b.{0,40}\b(secret|token|password|credential|private[_ -]?key|config)\b/i,'sensitive disclosure']
];
const sourceMutation=/\b(sed\s+-i|apply_patch|write|overwrite|replace)\b/i;
export function validatePlan({actions=[],allowMutation=false,target='',production=false}={}){
  const errors=[];
  for(const raw of actions){
    const action=String(raw).trim();
    for(const [rule,label] of blocked) if(rule.test(action)) errors.push(`${action}: ${label} is blocked`);
    if(sourceMutation.test(action)&&(!allowMutation||!target)) errors.push(`${action}: source mutation requires authorization and exact target`);
    if(production&&sourceMutation.test(action)) errors.push(`${action}: production source mutation is blocked`);
  }
  return {ok:errors.length===0,production,target,errors};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const result=validatePlan({actions:process.argv.slice(2)}); console.log(JSON.stringify(result,null,2)); process.exitCode=result.ok?0:2;}
