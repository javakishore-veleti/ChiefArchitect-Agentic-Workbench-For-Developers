#!/usr/bin/env node
import {fileURLToPath} from 'node:url';

const blocked=/^(FLUSHALL|FLUSHDB|DEBUG|SHUTDOWN|KEYS|MONITOR|MIGRATE|RESTORE|REPLICAOF|SLAVEOF|FAILOVER)\b|^CONFIG\s+SET\b|^MODULE\s+LOAD\b|^CLUSTER\s+RESET\b/i;
const writes=/^(SET|MSET|SETEX|PSETEX|DEL|UNLINK|EXPIRE|PEXPIRE|PERSIST|HSET|HDEL|LPUSH|RPUSH|LPOP|RPOP|SADD|SREM|ZADD|ZREM|XADD|XDEL|XACK|XCLAIM|EVAL|EVALSHA|FUNCTION)\b/i;

export function validateCommandPlan({commands=[],environment='',production=false,allowMutation=false}={}){
  const errors=[];
  for(const raw of commands){
    const command=String(raw).trim();
    if(blocked.test(command)) errors.push(`${command}: prohibited command`);
    if(/^SCAN\b/i.test(command)){
      const match=/\bMATCH\s+(\S+)/i.exec(command);
      if(!match||match[1]==='*'||!/[^*?\[\]]/.test(match[1])||!/\bCOUNT\s+\d+/i.test(command)) errors.push(`${command}: SCAN requires a bounded MATCH and COUNT`);
    }
    if(writes.test(command)&&(!allowMutation||production)) errors.push(`${command}: mutation not authorized${production?' in production':''}`);
  }
  return {ok:errors.length===0,environment,production,errors};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=validateCommandPlan({commands:process.argv.slice(2),production:process.env.REDIS_PRODUCTION==='true',allowMutation:process.env.REDIS_ALLOW_MUTATION==='true'});
  console.log(JSON.stringify(result,null,2)); process.exitCode=result.ok?0:2;
}
