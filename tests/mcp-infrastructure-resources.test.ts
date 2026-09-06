// @vitest-environment node
import { describe, expect, it } from "vitest";

import { getInfrastructureResources, searchAll } from "../packages/mcp/src/data-loader.mjs";
import { handleCallTool, handleReadResource } from "../packages/mcp/src/handlers.mjs";

describe("RR MCP infrastructure resources", () => {
  it("loads and searches the shared infrastructure catalog", () => {
    const rows = getInfrastructureResources().resources;
    expect(rows.some((item: { id: string }) => item.id === "doku.mcp_api_key")).toBe(true);
    expect(searchAll("DOKU MCP").some((hit: { kind: string }) => hit.kind === "infrastructure")).toBe(true);
  });

  it("exposes bounded list/get tool surfaces and rr:// resources", async () => {
    const listed = await handleCallTool({
      params: { name: "rr_list_infrastructure", arguments: { provider: "doku" } },
    });
    expect(JSON.stringify(listed)).toContain("doku.mcp_api_key");
    const got = await handleCallTool({
      params: { name: "rr_get_infrastructure", arguments: { id: "convex.custom_site_domain" } },
    });
    expect(JSON.stringify(got)).toContain("Convex HTTP Actions custom domain");
    const resource = await handleReadResource({ params: { uri: "rr://infrastructure/doku.mcp_endpoint" } });
    expect(JSON.stringify(resource)).toContain("https://mcp.doku.com/mcp");
  });
});
