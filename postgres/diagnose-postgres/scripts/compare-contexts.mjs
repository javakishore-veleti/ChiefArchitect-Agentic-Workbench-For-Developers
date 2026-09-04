#!/usr/bin/env node
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

function flatten(value,prefix='',out={}){for(const [key,item] of Object.entries(value||{})){const path=prefix?`${prefix}.${key}`:key;if(item&&typeof item==='object'&&!Array.isArray(item)) flatten(item,path,out);else out[path]=item;}return out;}
export function compareContexts(left,right){const a=flatten(left),b=flatten(right);return [...new Set([...Object.keys(a),...Object.keys(b)])].sort().filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k])).map(path=>({path,left:a[path]??null,right:b[path]??null}));}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [a,b]=process.argv.slice(2);console.log(JSON.stringify(compareContexts(JSON.parse(fs.readFileSync(a)),JSON.parse(fs.readFileSync(b))),null,2));}
