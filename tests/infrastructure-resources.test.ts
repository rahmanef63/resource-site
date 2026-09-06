// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import catalog from "../packages/cli/lib/infrastructure-resources.json";

const root = process.cwd();

describe("RR infrastructure resource catalog", () => {
  it("is a public definition catalog with unique ids and explicit authority boundaries", () => {
    expect(catalog.resourceClass).toBe("infrastructure");
    expect(catalog.rules.definitionAuthority).toBe("rahman-resources");
    expect(catalog.rules.credentialAuthority).toBe("mso-integrations");
    expect(catalog.rules.credentialAuthorities).toEqual(["mso-integrations", "deployment-secret-store"]);
    expect(catalog.rules.projectBindingAuthority).toBe("baton");
    const ids = catalog.resources.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of catalog.resources) {
      expect(item.docsUrl).toMatch(/^https:\/\//);
      if ("actionUrl" in item && item.actionUrl) expect(item.actionUrl).toMatch(/^https:\/\//);
      expect(["public", "sensitive", "secret"]).toContain(item.secretClassification);
      if (item.secretClassification !== "public") {
        expect(["mso-integrations", "deployment-secret-store"]).toContain(item.credentialAuthority);
      }
      expect(item.projectAuthority).toBe("baton");
    }
  });

  it("models DOKU Payment API and DOKU MCP as different credential surfaces", () => {
    const byId = new Map(catalog.resources.map((item) => [item.id, item]));
    expect(byId.get("doku.payment_secret_key")).toMatchObject({
      envKey: "DOKU_SECRET_KEY",
      secretClassification: "secret",
      credentialAuthority: "mso-integrations",
      runtimeDestination: "deployment-secret-store",
    });
    expect(byId.get("doku.mcp_api_key")).toMatchObject({
      envKey: "DOKU_MCP_API_KEY",
      secretClassification: "secret",
      credentialAuthority: "mso-integrations",
    });
    expect(byId.get("doku.mcp_endpoint")?.obtain).toContain("https://mcp.doku.com/mcp");
    expect(byId.get("doku.mcp_endpoint")?.obtain).toContain(
      "https://api-sandbox.doku.com/doku-mcp-server/mcp",
    );
  });

  it("keeps the DOKU setup helper credential-free", () => {
    const source = readFileSync(path.join(root, "scripts/setup-doku-mcp.mjs"), "utf8");
    expect(source).not.toContain(".env.local");
    expect(source).not.toContain("readFileSync");
    expect(source).not.toContain("Authorization");
    expect(source).not.toContain("Client-Id\": clientId");
    expect(source).toContain("credentialAuthority: \"mso-integrations\"");
    expect(source).toContain(".claude/doku-mcp.example.json");
  });
});
