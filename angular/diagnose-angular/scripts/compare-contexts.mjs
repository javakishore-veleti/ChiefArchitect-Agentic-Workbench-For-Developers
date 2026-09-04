#!/usr/bin/env node
import {fileURLToPath} from 'node:url';
const sensitive=/secret|token|password|authorization|credential|private.?key/i;
function flatten(value,prefix='',out={}){for(const [key,item] of Object.entries(value||{})){const path=prefix?`${prefix}.${key}`:key;if(sensitive.test(path)) continue;if(item&&typeof item==='object'&&!Array.isArray(item)) flatten(item,path,out);else out[path]=item;}return out;}
export function compareContexts(left={},right={}){const a=flatten(left),b=flatten(right); return [...new Set([...Object.keys(a),...Object.keys(b)])].sort().filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k])).map(field=>({field,left:a[field],right:b[field]}));}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [a='{}',b='{}']=process.argv.slice(2); console.log(JSON.stringify(compareContexts(JSON.parse(a),JSON.parse(b)),null,2));}
