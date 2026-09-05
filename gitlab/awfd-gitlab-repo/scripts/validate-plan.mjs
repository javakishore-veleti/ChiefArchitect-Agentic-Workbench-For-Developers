#!/usr/bin/env node
// Gate every GitLab write. A plan that does not pass this is not executed.
//
// This skill provisions; it does not tear down. Renaming, transferring,
// archiving and deleting are separate operations requiring their own explicit
// authorization for exact paths, so they are rejected here by construction.
import fs from 'node:fs';

export const ALLOWED_OPERATIONS = ['create-group', 'create-project', 'seed-project'];
const DESTRUCTIVE = ['delete', 'remove', 'destroy', 'archive', 'transfer', 'rename', 'move', 'purge', 'force-push'];

// GitLab paths: alphanumeric start, then alphanumerics, hyphens, underscores, dots.
const PATH_SEGMENT = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const RESERVED = new Set(['-', 'api', 'admin', 'groups', 'projects', 'users', 'dashboard', 'explore', 'help', 'new', 'uploads', 'assets']);

export function validatePlan(plan) {
  const errors = [];
  const root = String(plan?.root ?? '').trim();

  if (!root) errors.push('A root namespace is required; refusing to create groups at instance top level');
  else for (const segment of root.split('/')) {
    if (!PATH_SEGMENT.test(segment)) errors.push(`Root namespace segment "${segment}" is not a legal GitLab path`);
  }

  const operations = plan?.operations;
  if (!Array.isArray(operations) || !operations.length) errors.push('A plan requires at least one operation');

  const targets = new Set();
  for (const operation of operations ?? []) {
    const op = String(operation?.op ?? '');
    const target = String(operation?.path ?? '');

    if (!ALLOWED_OPERATIONS.includes(op)) {
      const destructive = DESTRUCTIVE.some(word => op.toLowerCase().includes(word));
      errors.push(destructive
        ? `Refusing "${op}" on ${target}: destructive operations require separate authorization naming exact paths, and this skill does not perform them`
        : `Unknown operation "${op}" on ${target}; allowed: ${ALLOWED_OPERATIONS.join(', ')}`);
      continue;
    }

    if (!target) { errors.push(`Operation ${op} has no target path`); continue; }
    for (const segment of target.split('/')) {
      if (!PATH_SEGMENT.test(segment)) errors.push(`"${target}" contains an illegal path segment "${segment}"`);
      else if (RESERVED.has(segment.toLowerCase())) errors.push(`"${target}" uses the reserved GitLab path segment "${segment}"`);
    }

    const key = `${op}:${target}`;
    if (targets.has(key)) errors.push(`Duplicate operation ${op} on ${target}`);
    targets.add(key);
  }

  return {ok: errors.length === 0, errors, operationCount: operations?.length ?? 0};
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  let raw = '';
  if (file && file !== '-') raw = fs.readFileSync(file, 'utf8');
  else for await (const chunk of process.stdin) raw += chunk;
  const result = validatePlan(JSON.parse(raw));
  if (!result.ok) { console.error(result.errors.join('\n')); process.exit(1); }
  console.log(`Plan accepted: ${result.operationCount} operations, all non-destructive.`);
}
