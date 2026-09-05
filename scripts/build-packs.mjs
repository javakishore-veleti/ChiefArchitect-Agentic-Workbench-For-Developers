#!/usr/bin/env node

import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packsRoot = path.join(root, "packages", "packs");
const harnessRoots = [".agents/skills", ".claude/skills", ".github/skills"];

const entries = {
  angular: [["awfd-angular", "angular/diagnose-angular", "Route Angular application diagnostics across components, routing, state, HTTP, authentication, testing, SSR, and builds."]],
  azure: [["awfd-azure", "azure/diagnose-azure", "Route Azure diagnostics across AKS, ACR, Key Vault, Entra, Cosmos DB, cache, monitoring, and connected services."]],
  databricks: [["awfd-databricks", "databricks/diagnose-databricks", "Route Databricks lakehouse, medallion, pipeline, governance, compute, SQL, AI, sharing, reliability, and cost diagnostics."]],
  datadog: [["awfd-datadog", "datadog/diagnose-datadog", "Route Datadog logs, traces, metrics, RUM, synthetics, monitors, incidents, security, AI observability, and cost diagnostics."]],
  "github-actions": [["awfd-github-actions", "github-actions/diagnose-github-actions", "Route GitHub Actions workflow, runner, OIDC, artifact, cache, security, deployment, rollback, observability, and cost diagnostics."]],
  postgres: [["awfd-postgres", "postgres/diagnose-postgres", "Route PostgreSQL catalog, security, query, index, transaction, maintenance, and replication diagnostics."]],
  redis: [["awfd-redis", "redis/diagnose-redis", "Route Redis correctness, performance, client, cluster, persistence, cache, and managed-service diagnostics."]],
  shopify: [
    ["awfd-shopify-admin-api", "shopify/admin-api/diagnose-admin-api", "Diagnose Shopify Admin GraphQL authentication, authorization, query, mutation, and API behavior."],
    ["awfd-shopify-cart", "shopify/carts/diagnose-cart", "Route Shopify cart and Hydrogen cart-state failures."],
    ["awfd-shopify-customer", "shopify/customers/diagnose-customer", "Route Shopify customer identity, account, profile, access, and metafield failures."],
    ["awfd-shopify-discount", "shopify/discounts/diagnose-discount", "Route Shopify discount configuration, eligibility, Function, and checkout failures."],
    ["awfd-shopify-order", "shopify/orders/diagnose-order", "Route Shopify order lifecycle, payment, fulfillment, return, webhook, and metafield failures."],
    ["awfd-shopify-product", "shopify/products/diagnose-product", "Route Shopify product, variant, inventory, publication, media, and metafield failures."],
    ["awfd-shopify-storefront-api", "shopify/storefront-api/diagnose-storefront-api", "Route Shopify Storefront GraphQL and Hydrogen transport failures."]
  ],
  "spring-boot": [["awfd-spring-boot", "spring-boot/diagnose-spring-boot", "Route Spring Boot web, security, data, transaction, configuration, test, messaging, batch, caching, observability, and runtime diagnostics."]]
};

const sharedRoots = {
  angular: ["angular/shared"],
  azure: ["azure/shared"],
  databricks: [],
  datadog: ["datadog/shared"],
  "github-actions": ["github-actions/shared"],
  postgres: ["postgres/shared"],
  redis: ["redis/shared"],
  shopify: ["shopify/shared"],
  "spring-boot": ["spring-boot/shared"]
};

function posix(value) {
  return value.split(path.sep).join("/");
}

const shopifyCoordinates = {
  "awfd-shopify-admin-api": "awfd:shopify:admin-api",
  "awfd-shopify-cart": "awfd:shopify:carts",
  "awfd-shopify-customer": "awfd:shopify:customers",
  "awfd-shopify-discount": "awfd:shopify:discounts",
  "awfd-shopify-order": "awfd:shopify:orders",
  "awfd-shopify-product": "awfd:shopify:products",
  "awfd-shopify-storefront-api": "awfd:shopify:storefront-api"
};

function coordinate(domain, name) {
  return shopifyCoordinates[name] ?? `awfd:${domain}`;
}

function skillText(domain, name, canonical, description) {
  const logical = coordinate(domain, name);
  return `---\nname: ${name}\ndescription: ${description}\nmetadata:\n  awfd-coordinate: "${logical}"\n---\n\nFollow \`${canonical}/SKILL.md\` from the repository root. Load only the matched pattern and its referenced artifacts.\n`;
}

async function copyRoot(relative, output) {
  const source = path.join(root, relative);
  const target = path.join(output, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, { recursive: true, preserveTimestamps: false });
}

async function buildDomain(domain) {
  const packageRoot = path.join(packsRoot, domain);
  const output = path.join(packageRoot, "dist");
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });

  const canonicalRoots = [...new Set(entries[domain].map(([, canonical]) => canonical))];
  for (const canonicalRoot of canonicalRoots) await copyRoot(canonicalRoot, output);
  for (const shared of sharedRoots[domain] ?? []) {
    // Shared content is already included when it sits below the domain root.
    if (!canonicalRoots.some((item) => shared === item || shared.startsWith(`${item}/`))) await copyRoot(shared, output);
  }

  for (const [name, canonical, description] of entries[domain]) {
    for (const harnessRoot of harnessRoots) {
      const directory = path.join(output, harnessRoot, name);
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, "SKILL.md"), skillText(domain, name, canonical, description), "utf8");
    }
  }

  const files = await listFiles(output);
  const manifest = {
    schemaVersion: 1,
    package: `@javakishore-veleti/awfd-${domain}`,
    domain,
    payloadRoot: "dist",
    skills: entries[domain].map(([id, canonical]) => ({ id, canonical, coordinate: coordinate(domain, id) })),
    files
  };
  await writeFile(path.join(packageRoot, "awfd-pack.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function listFiles(directory, prefix = "") {
  const result = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await listFiles(path.join(directory, entry.name), relative));
    else if (entry.isFile()) result.push(posix(relative));
  }
  return result;
}

const known = [...Object.keys(entries), "all"];
const requested = process.argv.slice(2);
const selected = requested.length ? requested : known;
for (const item of selected) {
  if (!known.includes(item)) throw new Error(`Unknown pack: ${item}`);
}
for (const domain of Object.keys(entries).sort()) {
  if (selected.includes(domain)) await buildDomain(domain);
}

if (selected.includes("all")) {
  const allRoot = path.join(packsRoot, "all");
  await rm(path.join(allRoot, "dist"), { recursive: true, force: true });
  await writeFile(path.join(allRoot, "awfd-pack.json"), `${JSON.stringify({
    schemaVersion: 1,
    package: "@javakishore-veleti/awfd-all",
    composition: Object.keys(entries).sort().map((domain) => `@javakishore-veleti/awfd-${domain}`)
  }, null, 2)}\n`, "utf8");
}
