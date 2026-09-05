#!/usr/bin/env node
// Normalize a described repository estate into a manifest of groups and projects.
//
// Accepts a JSON manifest or any markdown table whose headers name a repository
// and how it is grouped. The description is the source of truth; nothing here
// invents a project the description does not name.
//
//   parse-spec.mjs --json estate.json
//   parse-spec.mjs --markdown ARCHITECTURE.md
//   parse-spec.mjs --markdown ARCHITECTURE.md --tiers portfolio,program
import fs from 'node:fs';

const NAME_COLUMNS = ['service', 'repository', 'repo', 'project', 'name', 'component'];
// Outermost grouping first. A specification that names several of these nests
// them in this order. These are organizational columns only: architectural
// columns such as context or system group by design rather than by ownership,
// so they are used only when --tiers names them explicitly.
const TIER_COLUMNS = ['portfolio', 'domain', 'division', 'group', 'program', 'subgroup', 'team'];

export function toPath(value) {
  return String(value ?? '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const clean = cell => String(cell ?? '')
  .replace(/`/g, '').replace(/\*\*/g, '').replace(/<br\s*\/?>/gi, ' ')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').trim();

// Every pipe table in the document, as {headers, rows}.
export function extractTables(markdown) {
  const tables = [];
  const lines = markdown.split('\n');
  let fenced = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) { fenced = !fenced; continue; }
    if (fenced) continue;
    if (!lines[i].trim().startsWith('|')) continue;
    if (!/^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? '')) continue;
    const split = row => row.trim().replace(/^\||\|$/g, '').split('|').map(clean);
    const headers = split(lines[i]);
    const rows = [];
    let j = i + 2;
    for (; j < lines.length && lines[j].trim().startsWith('|'); j++) {
      const cells = split(lines[j]);
      if (cells.length === headers.length) rows.push(cells);
    }
    if (rows.length) tables.push({headers, rows});
    i = j - 1;
  }
  return tables;
}

const indexOfColumn = (headers, candidates) =>
  headers.findIndex(h => candidates.includes(h.toLowerCase().replace(/[^a-z]/g, '')));

export function parseMarkdown(markdown, {tiers} = {}) {
  const tables = extractTables(markdown);
  const requested = tiers?.length ? tiers.map(t => t.toLowerCase()) : null;

  const candidates = tables
    .map(t => ({...t, nameAt: indexOfColumn(t.headers, NAME_COLUMNS)}))
    .filter(t => t.nameAt >= 0)
    .map(t => {
      const order = requested ?? TIER_COLUMNS;
      const tierAt = order
        .map(tier => ({tier, at: indexOfColumn(t.headers, [tier])}))
        .filter(x => x.at >= 0);
      return {...t, tierAt};
    })
    .filter(t => t.tierAt.length > 0);

  if (!candidates.length) {
    throw new Error(
      `No table found with a repository-name column (${NAME_COLUMNS.join(', ')}) and at least one grouping column ` +
      `(${(requested ?? TIER_COLUMNS).join(', ')}). Pass --tiers to name the grouping columns explicitly.`
    );
  }
  // The richest table wins: most rows, then most grouping tiers.
  const table = candidates.sort((a, b) => b.rows.length - a.rows.length || b.tierAt.length - a.tierAt.length)[0];

  const projects = [];
  for (const cells of table.rows) {
    const name = toPath(cells[table.nameAt]);
    if (!name) continue;
    // Collapse a tier repeating its parent: a "Lab Ops" context inside a
    // "Lab Ops" portfolio is one group, not lab-ops/lab-ops.
    const segments = table.tierAt
      .map(({at}) => toPath(cells[at]))
      .filter(Boolean)
      .filter((segment, at, all) => segment !== all[at - 1]);
    if (!segments.length) continue;
    const metadata = {};
    table.headers.forEach((header, at) => {
      if (at === table.nameAt || table.tierAt.some(t => t.at === at)) return;
      const key = toPath(header);
      if (key && cells[at] && cells[at] !== '—') metadata[key] = cells[at];
    });
    projects.push({
      name,
      group: segments.join('/'),
      labels: table.tierAt.map(({tier, at}) => ({tier, label: cells[at]})),
      metadata
    });
  }
  return buildManifest(projects);
}

export function buildManifest(projects) {
  const groups = new Map();
  for (const project of projects) {
    const segments = project.group.split('/');
    for (let depth = 0; depth < segments.length; depth++) {
      const full = segments.slice(0, depth + 1).join('/');
      if (groups.has(full)) continue;
      groups.set(full, {
        path: segments[depth],
        name: project.labels?.[depth]?.label ?? segments[depth],
        parent: depth ? segments.slice(0, depth).join('/') : null,
        full
      });
    }
  }
  const seen = new Map();
  const collisions = [];
  for (const project of projects) {
    const full = `${project.group}/${project.name}`;
    if (seen.has(full)) collisions.push(full); else seen.set(full, project);
  }
  return {
    groups: [...groups.values()].sort((a, b) => a.full.split('/').length - b.full.split('/').length || a.full.localeCompare(b.full)),
    projects: projects.map(({labels, ...rest}) => rest),
    collisions: [...new Set(collisions)]
  };
}

export function normalizeManifest(document) {
  if (!Array.isArray(document?.projects)) throw new Error('A JSON manifest requires a projects array');
  const projects = document.projects.map(project => {
    const name = toPath(project.name ?? project.repo ?? project.service);
    if (!name) throw new Error(`Project entry has no usable name: ${JSON.stringify(project)}`);
    const group = String(project.group ?? project.namespace ?? '')
      .split('/').map(toPath).filter(Boolean)
      .filter((segment, at, all) => segment !== all[at - 1]).join('/');
    if (!group) throw new Error(`Project ${name} has no group`);
    return {name, group, ...(project.description && {description: project.description}), ...(project.metadata && {metadata: project.metadata})};
  });
  return buildManifest(projects);
}

export function parseSpec({json, markdown, tiers}) {
  if (json) return normalizeManifest(JSON.parse(fs.readFileSync(json, 'utf8')));
  if (markdown) return parseMarkdown(fs.readFileSync(markdown, 'utf8'), {tiers});
  throw new Error('Provide --json <file> or --markdown <file>');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const opt = name => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined; };
  try {
    const manifest = parseSpec({json: opt('json'), markdown: opt('markdown'), tiers: opt('tiers')?.split(',')});
    console.log(JSON.stringify(manifest, null, 2));
  } catch (error) { console.error(error.message); process.exit(2); }
}
