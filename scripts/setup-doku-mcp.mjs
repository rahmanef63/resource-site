#!/usr/bin/env node
/**
 * setup-doku-mcp — generate a credential-free DOKU MCP setup descriptor.
 *
 * This helper intentionally never reads DOKU credential values and never
 * writes an active .claude/mcp.json. RR owns public guidance; MSO Integrations
 * owns private named credentials; Baton owns project binding/status.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const CWD = process.cwd();
const OUTPUT = resolve(CWD, ".claude/doku-mcp.example.json");
const environment = (process.env.DOKU_MCP_ENV ?? "sandbox").trim().toLowerCase();

if (!new Set(["sandbox", "production"]).has(environment)) {
  console.error("[setup-doku-mcp] DOKU_MCP_ENV must be sandbox or production.");
  process.exit(1);
}

const url =
  environment === "production"
    ? "https://mcp.doku.com/mcp"
    : "https://api-sandbox.doku.com/doku-mcp-server/mcp";

const descriptor = {
  provider: "doku",
  transport: "http-streamable",
  environment,
  url,
  credentialAuthority: "mso-integrations",
  projectBindingAuthority: "baton",
  requiredResourceDefinitions: ["doku.mcp_client_id", "doku.mcp_api_key"],
  warning:
    "Credential values are intentionally absent. Configure a named private DOKU connection in MSO Integrations and inject it at runtime using the MCP client's supported auth mechanism.",
  docs: "https://developers.doku.com/accept-payments/doku-mcp-server",
};

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(descriptor, null, 2)}\n`, { mode: 0o600 });

console.log(`[setup-doku-mcp] wrote credential-free descriptor → ${OUTPUT}`);
console.log("[setup-doku-mcp] no DOKU Client ID/API Key was read or persisted.");
