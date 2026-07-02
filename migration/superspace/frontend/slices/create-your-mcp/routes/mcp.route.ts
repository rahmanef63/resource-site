// MCP Streamable HTTP endpoint. Drop this file at
//   `app/api/mcp/route.ts`
// in your Next.js app. Wire your Convex HTTP client (`convexHttp` below)
// and your tool registry (`TOOLS`) before deploying.
//
// Authentication accepts either an OAuth-issued bearer (from the
// /api/oauth/token flow) or the static MCP_API_KEY env (service-account
// / developer escape hatch). Both flow through requireAdmin server-side.

import { NextResponse } from "next/server";
import { dispatchJsonRpc } from "../lib/server";
import { checkAuth } from "../lib/auth";
import { runWithMcpContext } from "../lib/context";
import { exampleTools } from "../lib/tools/example";
import type { JsonRpcRequest, ToolDef } from "../lib/types";

// === Consumer wiring ========================================================
//
// 1. Replace the `convexHttp` stub (../lib/convex-http) with a real Convex
//    HTTP client — superspace uses `new ConvexHttpClient(...)` from
//    "convex/browser" (see app/api/ai/execute-tool/route.ts).
// 2. Append your tools to TOOLS — every tool is a ToolDef from
//    `../lib/types`.
// 3. Update SERVER_INFO with your app name + version.
// 4. Update INSTRUCTIONS with the system-prompt-style description AI
//    clients should see when they connect.
//
// Until you wire these, the MCP endpoint will only respond to ping (and the
// convexHttp stub throws on any token lookup — non-functional scaffold).

import { convexHttp } from "../lib/convex-http";

const SERVER_INFO = { name: "your-app-mcp", version: "0.1.0" };
const INSTRUCTIONS =
  "Replace this with what your AI clients should know about your domain. Workflow guidance + brand voice + pitfalls go here.";
const TOOLS: ToolDef[] = [...exampleTools];

// === End consumer wiring ====================================================

export const runtime = "nodejs";

const challenge = (siteUrl: string) =>
  // RFC 9728 hint so AI clients can rediscover the protected-resource
  // metadata document on a 401. Point at /.well-known/oauth-protected-resource.
  `Bearer realm="mcp", resource_metadata="${siteUrl}/.well-known/oauth-protected-resource"`;

const unauthorized = (siteUrl: string) =>
  new NextResponse(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized" },
      id: null,
    }),
    {
      status: 401,
      headers: {
        "content-type": "application/json",
        "www-authenticate": challenge(siteUrl),
      },
    },
  );

export async function POST(req: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const auth = await checkAuth(req.headers, async (token) => {
    return (await convexHttp.query("features/createYourMcp/query:findToken", {
      token,
    })) as { _id: string; scope: string | null } | null;
  });
  if (!auth.ok) return unauthorized(siteUrl);

  let body: JsonRpcRequest | JsonRpcRequest[];
  try {
    body = (await req.json()) as JsonRpcRequest | JsonRpcRequest[];
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
      { status: 400 },
    );
  }

  // The bearer used to authenticate this request is the token we forward
  // into every Convex admin mutation called by the tools. checkAuth
  // already validated it.
  const bearer =
    auth.kind === "oauth" ? auth.convexToken : (process.env.MCP_API_KEY as string);

  return runWithMcpContext({ token: bearer }, async () => {
    const opts = { serverInfo: SERVER_INFO, instructions: INSTRUCTIONS };
    if (Array.isArray(body)) {
      const results = await Promise.all(
        body.map((r) => dispatchJsonRpc(r, TOOLS, auth.scope, opts)),
      );
      const responses = results.filter((r) => r !== null);
      if (auth.kind === "oauth") {
        void convexHttp
          .mutation("features/createYourMcp/mutation:touchToken", { token: bearer })
          .catch(() => undefined);
      }
      if (responses.length === 0) return new NextResponse(null, { status: 202 });
      return NextResponse.json(responses);
    }

    const result = await dispatchJsonRpc(body, TOOLS, auth.scope, opts);
    if (auth.kind === "oauth") {
      void convexHttp
        .mutation("features/createYourMcp:touchToken", { token: bearer })
        .catch(() => undefined);
    }
    if (result === null) return new NextResponse(null, { status: 202 });
    return NextResponse.json(result);
  });
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return new NextResponse("Method Not Allowed — MCP server is POST-only", {
    status: 405,
    headers: { allow: "POST", "www-authenticate": challenge(siteUrl) },
  });
}
