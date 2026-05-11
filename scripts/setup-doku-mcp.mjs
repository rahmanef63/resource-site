#!/usr/bin/env node
/**
 * setup-doku-mcp — write a DOKU MCP server entry into .claude/mcp.json.
 *
 * Reads:
 *   DOKU_MCP_CLIENT_ID  (required)
 *   DOKU_MCP_API_KEY    (required) — will be base64-encoded as "<key>:"
 *   DOKU_MCP_URL        (optional) — defaults to https://mcp.doku.com
 *
 * From `.env.local` in cwd, then process.env.
 *
 * Writes to `.claude/mcp.json` (creates dir if missing). Preserves any
 * existing `mcpServers.*` entries.
 *
 * Idempotent — re-running updates the `doku` entry, leaves others.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const CWD = process.cwd();
const ENV_FILE = resolve(CWD, ".env.local");
const MCP_FILE = resolve(CWD, ".claude/mcp.json");
const DEFAULT_URL = "https://mcp.doku.com";

function readDotenv() {
  if (!existsSync(ENV_FILE)) return {};
  const text = readFileSync(ENV_FILE, "utf8");
  const map = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let [, k, v] = m;
    v = v.replace(/^['"]|['"]$/g, "");
    map[k] = v;
  }
  return map;
}

function readEnv(name) {
  return process.env[name] ?? readDotenv()[name];
}

function die(msg) {
  console.error(`[setup-doku-mcp] ${msg}`);
  process.exit(1);
}

const clientId = readEnv("DOKU_MCP_CLIENT_ID");
const apiKey = readEnv("DOKU_MCP_API_KEY");
const url = readEnv("DOKU_MCP_URL") ?? DEFAULT_URL;

if (!clientId) die("DOKU_MCP_CLIENT_ID not set (env or .env.local).");
if (!apiKey) die("DOKU_MCP_API_KEY not set (env or .env.local).");

const auth = "Basic " + Buffer.from(`${apiKey}:`).toString("base64");

let config = { mcpServers: {} };
if (existsSync(MCP_FILE)) {
  try {
    config = JSON.parse(readFileSync(MCP_FILE, "utf8"));
    if (!config.mcpServers || typeof config.mcpServers !== "object") {
      config.mcpServers = {};
    }
  } catch (err) {
    die(`Existing ${MCP_FILE} is not valid JSON — refusing to overwrite.\n  ${err.message}`);
  }
}

config.mcpServers.doku = {
  type: "http",
  url,
  headers: {
    "Client-Id": clientId,
    Authorization: auth,
  },
};

mkdirSync(dirname(MCP_FILE), { recursive: true });
writeFileSync(MCP_FILE, JSON.stringify(config, null, 2) + "\n");

console.log(`[setup-doku-mcp] wrote DOKU MCP entry → ${MCP_FILE}`);
console.log(`[setup-doku-mcp] reload Claude Code to pick up the new server.`);
