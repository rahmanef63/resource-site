// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { McpBackend } from "./backend";
import { handleMcpPost } from "./mcp-http";
import { handleOauthTokenPost } from "./oauth-http";

const backend: McpBackend = {
  findToken: async () => null,
  touchToken: async () => ({ success: true }),
  exchangeCode: async () => ({
    access_token: "token",
    token_type: "Bearer",
    expires_in: 3600,
  }),
};

describe("create-your-mcp HTTP core", () => {
  it("dispatches MCP over standard Request/Response with static bearer fallback", async () => {
    const apiKey = "a".repeat(32);
    const req = new Request("https://app.example.com/api/mcp", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize" }),
    });
    const res = await handleMcpPost(req, { backend, tools: [], apiKey });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.result.protocolVersion).toBe("2024-11-05");
  });

  it("exchanges an OAuth code through the injected backend", async () => {
    const req = new Request("https://app.example.com/api/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: "code",
        redirect_uri: "https://client.example.com/callback",
        client_id: "client",
        code_verifier: "verifier",
      }),
    });
    const res = await handleOauthTokenPost(req, backend);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ token_type: "Bearer" });
  });
});
