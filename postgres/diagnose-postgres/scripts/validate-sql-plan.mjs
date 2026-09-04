#!/usr/bin/env node
import {fileURLToPath} from 'node:url';

function withoutLiterals(sql){return String(sql).replace(/--[^\n]*|\/\*[\s\S]*?\*\/|'(?:''|[^'])*'|"(?:""|[^"])*"/g,' ');}
export function validateSqlPlan({sql='',production=false,statementTimeoutMs=0,transactionReadOnly=false}={}){
  const errors=[]; const clean=withoutLiterals(sql).trim();
  const semicolons=(clean.match(/;/g)||[]).length;
  if(!clean) errors.push('SQL is empty');
  if(semicolons>1||(semicolons===1&&!/;\s*$/.test(clean))) errors.push('multiple statements are prohibited');
  if(!/^\s*(SELECT|WITH|EXPLAIN\s+(?!.*\bANALYZE\b))/i.test(clean)) errors.push('only read-only SELECT, WITH, or non-ANALYZE EXPLAIN is allowed');
  const rules=[[/\b(INSERT|UPDATE|DELETE|MERGE|UPSERT|CREATE|ALTER|DROP|TRUNCATE|GRANT|REVOKE|COMMENT|REINDEX|VACUUM|CLUSTER|REFRESH)\b/i,'DML or DDL is prohibited'],[/\bCOPY\b[\s\S]*\bPROGRAM\b/i,'COPY PROGRAM is prohibited'],[/\b(DO|CALL)\b/i,'DO and CALL are prohibited'],[/\bEXPLAIN\b[\s\S]*\bANALYZE\b/i,'EXPLAIN ANALYZE executes the statement'],[/\bpg_(terminate|cancel)_backend\s*\(/i,'backend cancellation or termination is prohibited'],[/\bSECURITY\s+DEFINER\b/i,'SECURITY DEFINER operations are prohibited'],[/\bSET\s+(?:LOCAL\s+)?search_path\b/i,'changing search_path is prohibited']];
  for(const [pattern,message] of rules) if(pattern.test(clean)) errors.push(message);
  if(production&&!(Number(statementTimeoutMs)>0)) errors.push('production requires a positive statement_timeout');
  if(production&&transactionReadOnly!==true) errors.push('production requires a read-only transaction');
  return {ok:errors.length===0,production,errors:[...new Set(errors)]};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=validateSqlPlan({sql:process.argv.slice(2).join(' '),production:process.env.POSTGRES_PRODUCTION==='true',statementTimeoutMs:Number(process.env.POSTGRES_STATEMENT_TIMEOUT_MS||0),transactionReadOnly:process.env.POSTGRES_TRANSACTION_READ_ONLY==='true'});
  console.log(JSON.stringify(result,null,2)); process.exitCode=result.ok?0:2;
}
