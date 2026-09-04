#!/usr/bin/env node
import fs from 'node:fs';
const [aPath,bPath]=process.argv.slice(2);if(!aPath||!bPath){console.error('Usage: compare-order-snapshots.mjs BEFORE.json AFTER.json');process.exit(2)}
const unwrap=x=>x?.data?.order??x?.order??x;const a=unwrap(JSON.parse(fs.readFileSync(aPath))),b=unwrap(JSON.parse(fs.readFileSync(bPath)));
const pick=o=>({id:o?.id,name:o?.name,updatedAt:o?.updatedAt,financial:o?.displayFinancialStatus,fulfillment:o?.displayFulfillmentStatus,returnStatus:o?.returnStatus,closed:o?.closed,cancelledAt:o?.cancelledAt,currentTotal:o?.currentTotalPriceSet,totalOutstanding:o?.totalOutstandingSet,totalRefunded:o?.totalRefundedSet,lineItems:o?.lineItems?.nodes?.map(x=>({id:x.id,sku:x.sku,quantity:x.quantity,currentQuantity:x.currentQuantity}))});
const left=pick(a),right=pick(b),changes={};for(const k of Object.keys(left))if(JSON.stringify(left[k])!==JSON.stringify(right[k]))changes[k]={before:left[k]??null,after:right[k]??null};console.log(JSON.stringify({sameOrder:left.id===right.id,changes},null,2));
