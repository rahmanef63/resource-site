#!/usr/bin/env node
// rahman-resources-mcp — Model Context Protocol server for the Rahman kitab.
//
// Stdio transport (default) — wire into Claude Code / Cursor / Cline via:
//   { "mcpServers": { "rahman-resources": { "command": "npx", "args": ["-y", "rahman-resources-mcp"] } } }
//
// HTTP transport — enable with --http or MCP_HTTP=1.
//
// Tools (read-only): rr_list_templates, rr_list_features, rr_list_recipes,
//   rr_list_skills, rr_search, rr_get, rr_compose_init_command,
//   rr_compose_add_commands, rr_list_slices, rr_get_slice, rr_compose_app,
//   rr_audit_slice, rr_list_workflows, rr_get_workflow.
//
// Resources: rr://manifest, rr://templates/{slug}, rr://features/{slug},
//   rr://recipes/{slug}, rr://skills/{slug}, rr://slices/{slug},
//   rr://workflow/{kind}, rr://graph/lineage[/...], rr://graph/consumers/{name}.
//
// Internals split across ../src/{tools-definitions,handlers,response-builders,
//   oauth,oauth-routes,oauth-consent-page,http-helpers,http-transport}.mjs.

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createRequire } from "node:module";

import {
  handleListTools, handleCallTool, handleListResources, handleReadResource,
} from "../src/handlers.mjs";
import { startHttpServer } from "../src/http-transport.mjs";

const require = createRequire(import.meta.url);
const PKG = require("../package.json");

// Build a fresh MCP Server with all handlers wired. Used per-request in
// stateless HTTP mode and once at boot in stdio mode.
function makeServer() {
  const s = new Server(
    { name: "rahman-resources", version: PKG.version },
    { capabilities: { tools: {}, resources: {} } },
  );
  s.setRequestHandler(ListToolsRequestSchema, handleListTools);
  s.setRequestHandler(CallToolRequestSchema, handleCallTool);
  s.setRequestHandler(ListResourcesRequestSchema, handleListResources);
  s.setRequestHandler(ReadResourceRequestSchema, handleReadResource);
  return s;
}

const useHttp = process.argv.includes("--http") || process.env.MCP_HTTP === "1";

if (useHttp) {
  startHttpServer({ makeServer, version: PKG.version });
} else {
  const transport = new StdioServerTransport();
  const server = makeServer();
  await server.connect(transport);
}
