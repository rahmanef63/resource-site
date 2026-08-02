#!/usr/bin/env node
/**
 * Dokploy redeploy trigger — kitab (rahmanef-resources / resource-site).
 *
 * Use when:
 *   - Webhook didn't pick up a push (Dokploy occasionally misses)
 *   - Want to force rebuild without an empty commit
 *   - Sanity-check the deploy pipeline post-validation
 *
 * Reads env: DOKPLOY_API_URL, DOKPLOY_API_KEY (from ~/.bashrc).
 * Idempotent — Dokploy queues a new deployment regardless.
 *
 * Usage:
 *   node scripts/dokploy-redeploy.mjs                 # redeploy kitab site
 *   node scripts/dokploy-redeploy.mjs --status        # just show last 5 deploys
 *   APP=mcp-resource node scripts/dokploy-redeploy.mjs # redeploy MCP server
 */

const KITAB_APP_ID = "trpQI_jd9DqRutpF6MHCu";        // resource-site (kitab Next.js)
const MCP_APP_ID = "tprJ-5FTTMgBAkuAedRxA";          // mcp-resource (MCP server)

const APP_ALIAS = process.env.APP || "kitab";
const APP_IDS = {
  kitab: KITAB_APP_ID,
  "resource-site": KITAB_APP_ID,
  mcp: MCP_APP_ID,
  "mcp-resource": MCP_APP_ID,
};
const appId = APP_IDS[APP_ALIAS];
if (!appId) {
  console.error(`unknown APP alias "${APP_ALIAS}". Valid: ${Object.keys(APP_IDS).join(", ")}`);
  process.exit(1);
}

const url = process.env.DOKPLOY_API_URL;
const key = process.env.DOKPLOY_API_KEY;
if (!url || !key) {
  console.error("DOKPLOY_API_URL or DOKPLOY_API_KEY missing — source ~/.bashrc");
  process.exit(1);
}

const headers = { "x-api-key": key, "Content-Type": "application/json" };
const statusOnly = process.argv.includes("--status");

async function fetchOne() {
  const r = await fetch(`${url}/application.one?applicationId=${appId}`, { headers });
  if (!r.ok) throw new Error(`application.one ${r.status} ${r.statusText}`);
  return r.json();
}

async function trigger() {
  const r = await fetch(`${url}/application.deploy`, {
    method: "POST",
    headers,
    body: JSON.stringify({ applicationId: appId }),
  });
  if (!r.ok) throw new Error(`application.deploy ${r.status} ${r.statusText}`);
  return r.text();
}

function fmtTime(iso) {
  return iso ? iso.replace("T", " ").replace(/\.\d+Z$/, "Z") : "?";
}

function printDeploys(deps, n = 5) {
  const sorted = [...deps].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  for (const d of sorted.slice(0, n)) {
    const title = (d.title || "").replace(/\n.*$/s, "").slice(0, 80);
    console.log(`  ${fmtTime(d.createdAt)} | ${(d.status || "?").padEnd(8)} | ${title}`);
  }
}

const app = await fetchOne();
console.log(`app: ${app.name} (${app.appName})`);
console.log(`repo: ${app.owner}/${app.repository} branch=${app.branch} autoDeploy=${app.autoDeploy}`);
console.log(`status: ${app.applicationStatus}`);
console.log();
console.log("=== last 5 deployments ===");
printDeploys(app.deployments || []);

if (statusOnly) process.exit(0);

console.log();
console.log("triggering redeploy…");
await trigger();
console.log("queued. poll with: node scripts/dokploy-redeploy.mjs --status");
