#!/usr/bin/env node
import fs from 'node:fs';

const rules = [
  ['creation', /cartcreate|create(?:d|ing)? (?:a )?cart|null cart|two (?:different )?carts|concurrent/i],
  ['lines-inventory', /cartlines|merchandise|variant|inventory|quantity|line item|selling plan|available|publication/i],
  ['buyer-identity', /buyeridentity|buyer identity|customer access|company location|b2b|logged.in customer/i],
  ['pricing-markets', /price|pricing|currency|market|country|catalog|subtotal|totalamount|tax/i],
  ['discounts', /discount|promo|coupon|gift card|applicable|allocation/i],
  ['delivery', /delivery|shipping|carrier|postal|postcode|address|pickup|rate/i],
  ['lifecycle-checkout', /checkouturl|checkout url|expired|lost cart|cart id|cart key|recreated|after order/i],
  ['cart-transforms', /cart transform|bundle|expand|merge|component|function.*cart|parent.*line/i],
  ['hydrogen-sync', /hydrogen|drawer|badge|bubble|stale|optimistic|revalidat|cookie|session|theme|ui/i],
  ['throttling-version', /429|403|throttl|rate limit|complexity|api version|regression|timeout|cloudflare|bot/i]
];

export function classifyCartIssue(input) {
  const text = typeof input === 'string' ? input : JSON.stringify(input);
  const ranked = rules.map(([category, regex]) => ({category, score: (text.match(regex) || []).length}))
    .filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.category.localeCompare(b.category));
  const selected = (ranked.length ? ranked : [{category: 'creation', score: 0}]).slice(0, 2);
  return {selected: selected.map(x => x.category), patterns: selected.map(x => `patterns/${x.category}.md`), scores: ranked};
}

if (import.meta.url === new URL('file://' + process.argv[1]).href) {
  const i = process.argv.indexOf('--file');
  const input = i >= 0 ? fs.readFileSync(process.argv[i + 1], 'utf8') : process.argv.slice(2).join(' ');
  console.log(JSON.stringify(classifyCartIssue(input), null, 2));
}
