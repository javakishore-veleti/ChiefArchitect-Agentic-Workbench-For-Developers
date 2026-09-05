#!/usr/bin/env node
// Create the groups and projects a specification describes. Dry run is the
// default; nothing is written without --apply.
//
//   provision.mjs --markdown ARCHITECTURE.md --root akiv
//   provision.mjs --json estate.json --root akiv --apply
//   provision.mjs --json estate.json --root akiv --apply --seed
//
// Credentials for --apply: AWFD_GITLAB_TOKEN with the `api` scope, sent as
// PRIVATE-TOKEN by default. Use --auth bearer for an OAuth 2.0 token or
// --auth job-token in CI (CI_JOB_TOKEN is picked up automatically).
import {parseSpec} from './parse-spec.mjs';
import {validatePlan} from './validate-plan.mjs';
import {authHeader, resolveCredential, describeAuthFailure} from './auth.mjs';

const argv = process.argv.slice(2);
const flag = name => argv.includes(`--${name}`);
const opt = (name, fallback) => { const i = argv.indexOf(`--${name}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback; };

const host = (opt('host', process.env.AWFD_GITLAB_HOST || 'https://gitlab.com')).replace(/\/$/, '');
const root = opt('root');
const apply = flag('apply');
const seed = flag('seed');
const visibility = opt('visibility', 'private');

if (!root) { console.error('Specify the existing root namespace with --root <path>'); process.exit(2); }

const manifest = parseSpec({json: opt('json'), markdown: opt('markdown'), tiers: opt('tiers')?.split(',')});
if (manifest.collisions.length) {
  console.error(`These project paths collide after normalization:\n  ${manifest.collisions.join('\n  ')}`);
  process.exit(2);
}

const plan = {
  root,
  operations: [
    ...manifest.groups.map(g => ({op: 'create-group', path: `${root}/${g.full}`})),
    ...manifest.projects.map(p => ({op: 'create-project', path: `${root}/${p.group}/${p.name}`})),
    ...(seed ? manifest.projects.map(p => ({op: 'seed-project', path: `${root}/${p.group}/${p.name}`})) : [])
  ]
};

const verdict = validatePlan(plan);
if (!verdict.ok) { console.error(`Plan rejected:\n  ${verdict.errors.join('\n  ')}`); process.exit(1); }

console.log(`${apply ? 'Provisioning' : 'Planning'} on ${host}/${root}`);
console.log(`${manifest.groups.length} groups, ${manifest.projects.length} projects${seed ? ', seeding specifications' : ''}\n`);

if (!apply) {
  let namespace = null;
  for (const project of [...manifest.projects].sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name))) {
    if (project.group !== namespace) { console.log(`  ${root}/${project.group}/`); namespace = project.group; }
    const detail = Object.entries(project.metadata ?? {}).slice(0, 4).map(([k, v]) => `${k}=${v}`).join('  ');
    console.log(`      ${project.name.padEnd(34)}${detail}`);
  }
  console.log(`\nDry run. Nothing was created. Re-run with --apply once this plan is authorized.`);
  process.exit(0);
}

const {token, scheme} = resolveCredential({flag: opt('auth')});
if (!token) {
  console.error('AWFD_GITLAB_TOKEN with the `api` scope is required for --apply (or CI_JOB_TOKEN inside a GitLab job).');
  process.exit(2);
}
const credentials = authHeader(scheme, token);

async function api(method, endpoint, body) {
  const response = await fetch(`${host}/api/v4${endpoint}`, {
    method,
    headers: {...credentials, ...(body && {'Content-Type': 'application/json'})},
    body: body ? JSON.stringify(body) : undefined
  });
  if (response.status === 404) return null;
  const text = await response.text();
  const authFailure = describeAuthFailure(response.status, scheme, method, endpoint);
  if (authFailure) throw new Error(authFailure);
  // Never include the response body verbatim beyond a short excerpt, and never the credential.
  if (!response.ok) throw new Error(`GitLab ${method} ${endpoint} -> ${response.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}
const findGroup = p => api('GET', `/groups/${encodeURIComponent(p)}`);
const findProject = p => api('GET', `/projects/${encodeURIComponent(p)}`);

const specification = project => `# ${project.name}

Generated from the estate specification. Change the specification and re-provision rather than editing this file.

| Property | Value |
|---|---|
| Namespace | \`${root}/${project.group}\` |
${Object.entries(project.metadata ?? {}).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}
`;

const catalogInfo = project => `apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: ${project.name}
${Object.keys(project.metadata ?? {}).length ? '  annotations:\n' + Object.entries(project.metadata).map(([k, v]) => `    estate/${k}: ${JSON.stringify(String(v))}`).join('\n') + '\n' : ''}spec:
  type: service
  lifecycle: production
  owner: group:${project.group.replace(/\//g, '-')}
`;

const rootGroup = await findGroup(root);
if (!rootGroup) { console.error(`Root namespace ${root} not found, or the token cannot see it.`); process.exit(1); }

const created = {groups: 0, projects: 0, seeded: 0};
const present = {groups: 0, projects: 0, seeded: 0};
const inaccessible = [];

for (const group of manifest.groups) {
  const full = `${root}/${group.full}`;
  try {
    if (await findGroup(full)) { present.groups++; console.log(`  = ${full}`); continue; }
    const parentPath = group.parent ? `${root}/${group.parent}` : root;
    const parent = await findGroup(parentPath);
    if (!parent) { inaccessible.push(parentPath); console.log(`  ! ${full} (parent ${parentPath} unavailable)`); continue; }
    await api('POST', '/groups', {name: group.name, path: group.path, parent_id: parent.id, visibility});
    created.groups++;
    console.log(`  + ${full}`);
  } catch (error) { inaccessible.push(`${full}: ${error.message}`); console.log(`  ! ${full}`); }
}

for (const project of manifest.projects) {
  const namespace = `${root}/${project.group}`;
  const full = `${namespace}/${project.name}`;
  try {
    let record = await findProject(full);
    if (record) { present.projects++; console.log(`  = ${full}`); }
    else {
      const group = await findGroup(namespace);
      if (!group) { inaccessible.push(namespace); console.log(`  ! ${full} (namespace unavailable)`); continue; }
      record = await api('POST', '/projects', {
        name: project.name, path: project.name, namespace_id: group.id, visibility,
        description: project.description ?? (Object.entries(project.metadata ?? {}).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' · ') || undefined),
        initialize_with_readme: false
      });
      created.projects++;
      console.log(`  + ${full}`);
    }
    if (seed) {
      const branch = record.default_branch ?? 'main';
      if (await api('GET', `/projects/${record.id}/repository/files/README.md?ref=${branch}`)) { present.seeded++; continue; }
      await api('POST', `/projects/${record.id}/repository/commits`, {
        branch, commit_message: `Add specification for ${project.name}`,
        actions: [
          {action: 'create', file_path: 'README.md', content: specification(project)},
          {action: 'create', file_path: 'catalog-info.yaml', content: catalogInfo(project)}
        ]
      });
      created.seeded++;
    }
  } catch (error) { inaccessible.push(`${full}: ${error.message}`); console.log(`  ! ${full}`); }
}

console.log(`\nGroups:   ${created.groups} created, ${present.groups} already present`);
console.log(`Projects: ${created.projects} created, ${present.projects} already present`);
if (seed) console.log(`Seeded:   ${created.seeded} committed, ${present.seeded} already had content`);
if (inaccessible.length) {
  console.log(`\nInaccessible or failed (${inaccessible.length}) — these were not created and are not empty results:`);
  for (const entry of inaccessible) console.log(`  ${entry}`);
  process.exit(1);
}
