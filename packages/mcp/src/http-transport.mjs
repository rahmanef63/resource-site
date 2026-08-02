// HTTP transport for rahman-resources-mcp.
// Stateless: fresh Server + Transport per request (SDK requirement).

import { createServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { readJsonBody, bearerMatches, MAX_BODY_BYTES, getArg } from "./http-helpers.mjs";
import { handleOAuthMetadata, handleOAuthAuthorize, handleOAuthToken } from "./oauth-routes.mjs";

const IS_PROD = process.env.NODE_ENV === "production";

export function startHttpServer({ makeServer, version }) {
  const port = parseInt(getArg("--port") ?? process.env.PORT ?? "8000", 10);
  const host = getArg("--host") ?? process.env.HOST ?? "0.0.0.0";
  const bearer = process.env.MCP_BEARER_TOKEN || null;
  const oauthKey = process.env.MCP_OAUTH_SIGNING_KEY || null;
  const publicBase = process.env.MCP_BASE_URL || null;

  const httpServer = createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Mcp-Session-Id, Last-Event-ID");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    const reqOrigin = publicBase || (req.headers.host ? `https://${req.headers.host}` : "");

    if (req.url === "/health" || req.url === "/") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        name: "rahman-resources-mcp",
        version,
        endpoint: "/mcp",
        mcp_open: !bearer,
        oauth_endpoints: !!oauthKey,
      }));
      return;
    }

    if (oauthKey) {
      if (handleOAuthMetadata(req, res, { reqOrigin })) return;
      if (handleOAuthAuthorize(req, res, { reqOrigin })) return;
      if (await handleOAuthToken(req, res, { oauthKey })) return;
    }

    const isMcp = req.url === "/mcp" || (req.url && req.url.startsWith("/mcp?"));
    if (!isMcp) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "not_found", hint: "POST /mcp" }));
      return;
    }

    if (bearer) {
      const auth = req.headers["authorization"];
      if (!bearerMatches(auth, bearer)) {
        res.statusCode = 401;
        res.setHeader("WWW-Authenticate", `Bearer realm="rahman-resources-mcp"`);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "unauthorized" }));
        return;
      }
    }

    let perReqTransport;
    let perReqServer;
    try {
      const body = req.method === "POST" ? await readJsonBody(req) : undefined;
      perReqTransport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      perReqServer = makeServer();
      await perReqServer.connect(perReqTransport);
      res.on("close", () => {
        perReqTransport?.close?.();
        perReqServer?.close?.();
      });
      await perReqTransport.handleRequest(req, res, body);
    } catch (err) {
      console.error("[mcp/http] handleRequest error:", err);
      if (!res.headersSent) {
        const status = err?.statusCode ?? 500;
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json");
        const payload = IS_PROD
          ? { error: status === 413 ? "payload_too_large" : "internal_error" }
          : { error: "internal_error", message: String(err?.message ?? err) };
        res.end(JSON.stringify(payload));
      }
      try { perReqTransport?.close?.(); } catch {}
      try { perReqServer?.close?.(); } catch {}
    }
  });

  // Anti-slowloris timeouts.
  httpServer.requestTimeout = 30_000;
  httpServer.headersTimeout = 10_000;
  httpServer.keepAliveTimeout = 5_000;

  httpServer.listen(port, host, () => {
    console.error(`rahman-resources-mcp v${version} — HTTP transport`);
    console.error(`  listening:  http://${host}:${port}`);
    console.error(`  endpoint:   POST /mcp  (Streamable HTTP, stateless)`);
    console.error(`  health:     GET /health`);
    console.error(`  /mcp auth:  ${bearer ? "env-Bearer (MCP_BEARER_TOKEN, constant-time)" : "OPEN — public read-only kitab manifest"}`);
    if (oauthKey) {
      console.error(`  /oauth:     enabled (ceremonial — tokens issued, not enforced on /mcp)`);
      console.error(`  oauth as:   ${publicBase || "(derive from Host)"} — /oauth/authorize + /api/oauth/token`);
      console.error(`  discovery:  /.well-known/oauth-{authorization-server,protected-resource}`);
    } else {
      console.error(`  /oauth:     disabled — set MCP_OAUTH_SIGNING_KEY to expose ceremonial OAuth for ChatGPT form`);
    }
    console.error(`  limits:     body=${MAX_BODY_BYTES}B req=${httpServer.requestTimeout}ms hdr=${httpServer.headersTimeout}ms`);
  });
}
