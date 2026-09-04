#!/usr/bin/env node
const forbidden = /(?:\/actuator\/(?:env|configprops|loggers|shutdown|refresh)|\b(?:delete|truncate|drop|alter|insert|update)\b|\b(?:purge|ack|nack|publish|produce)\b|\b(?:restart|redeploy|deploy|scale)\b)/i;
const secretExposure = /(?:print|show|dump|return|read).{0,30}(?:secret|password|credential|token|private[-_ ]?key|environment|configprops)/i;
export function validatePlan(plan,{environment='unknown'}={}) {
  const actions = Array.isArray(plan) ? plan : plan.actions;
  if (!Array.isArray(actions) || !actions.length) throw new Error('At least one diagnostic action is required');
  const violations=[];
  for (const [i,a] of actions.entries()) {
    const text=typeof a==='string'?a:JSON.stringify(a);
    if (forbidden.test(text)) violations.push({index:i,reason:'mutation-or-sensitive-endpoint'});
    if (secretExposure.test(text)) violations.push({index:i,reason:'secret-or-configuration-exposure'});
    if (/\bscan\s+all|select\s+\*/i.test(text)) violations.push({index:i,reason:'unbounded-data-read'});
    if (/prod(?:uction)?/i.test(environment) && /\b(?:restart|deploy|scale|write|mutate)\b/i.test(text)) violations.push({index:i,reason:'production-mutation'});
  }
  return {allowed:violations.length===0, mode:'read-only', violations};
}
if(import.meta.url===`file://${process.argv[1]}`){const result=validatePlan(JSON.parse(process.argv[2]||'[]'),{environment:process.env.SPRING_BOOT_ENV}); console.log(JSON.stringify(result,null,2)); process.exitCode=result.allowed?0:3;}
