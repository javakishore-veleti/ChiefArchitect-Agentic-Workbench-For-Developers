#!/usr/bin/env node
const blocked=[
  /\baz\s+(delete|deployment\s+delete|group\s+delete|role\s+assignment\s+(create|delete)|keyvault\s+secret\s+show)\b/i,
  /\bkubectl\s+(delete|apply|replace|patch|edit|scale|rollout\s+(restart|undo))\b/i,
  /\b(helm\s+(install|upgrade|uninstall)|terraform\s+(apply|destroy)|pulumi\s+(up|destroy))\b/i,
  /(--query\s+['"]?value\b|show-secret|list-credentials|credential\s+reset)/i,
  /\b(restart|redeploy|rotate|purge|flushall|flushdb)\b/i
];
export function validate(plan){
  const actions=Array.isArray(plan)?plan:plan?.actions;
  if(!Array.isArray(actions)||!actions.length)return {allowed:false,reasons:['A non-empty actions array is required.']};
  const reasons=[];
  for(const [i,a] of actions.entries()){
    const command=typeof a==='string'?a:a?.command;
    if(!command)reasons.push(`Action ${i+1} has no command.`);
    else if(blocked.some(r=>r.test(command)))reasons.push(`Action ${i+1} is mutating or exposes sensitive values.`);
    if(typeof a==='object'&&a!==null&&!a.subscription&&!/kubectl/i.test(command||''))reasons.push(`Action ${i+1} lacks an explicit subscription.`);
  }
  return {allowed:reasons.length===0,reasons};
}
if(import.meta.url===`file://${process.argv[1]}`){let raw='';for await(const c of process.stdin)raw+=c;console.log(JSON.stringify(validate(JSON.parse(raw)),null,2));}
