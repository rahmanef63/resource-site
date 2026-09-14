import { checkAuth } from "./auth";
import type { McpBackend } from "./backend";
import { runWithMcpContext } from "./context";
import { dispatchJsonRpc, type DispatchOptions } from "./server";
import type { JsonRpcRequest, ToolDef } from "./types";

export type McpHttpOptions = DispatchOptions & {
  backend: McpBackend;
  tools: ToolDef[];
  siteUrl?: string;
  apiKey?: string;
};

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

const siteOrigin = (req: Request, configured?: string) =>
  configured || process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

const challenge = (origin: string) =>
  `Bearer realm="mcp", resource_metadata="${origin}/.well-known/oauth-protected-resource"`;

export async function handleMcpPost(
  req: Request,
  options: McpHttpOptions,
): Promise<Response> {
  const apiKey = options.apiKey ?? process.env.MCP_API_KEY;
  const auth = await checkAuth(req.headers, options.backend.findToken, apiKey);
  const origin = siteOrigin(req, options.siteUrl);
  if (!auth.ok) {
    return json(
      { jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" }, id: null },
      401,
      { "www-authenticate": challenge(origin) },
    );
  }

  let body: JsonRpcRequest | JsonRpcRequest[];
  try {
    body = (await req.json()) as JsonRpcRequest | JsonRpcRequest[];
  } catch {
    return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }, 400);
  }

  const bearer = auth.kind === "oauth" ? auth.convexToken : apiKey;
  if (!bearer) return json({ error: "server_error" }, 500);
  const dispatchOptions: DispatchOptions = {
    serverInfo: options.serverInfo,
    instructions: options.instructions,
  };

  return runWithMcpContext({ token: bearer }, async () => {
    const dispatch = (request: JsonRpcRequest) =>
      dispatchJsonRpc(request, options.tools, auth.scope, dispatchOptions);
    const rawResults = Array.isArray(body)
      ? await Promise.all(body.map(dispatch))
      : [await dispatch(body)];
    const responses = rawResults.filter((result) => result !== null);
    if (auth.kind === "oauth") void options.backend.touchToken(auth.tokenHash).catch(() => undefined);
    if (responses.length === 0) return new Response(null, { status: 202 });
    return json(Array.isArray(body) ? responses : responses[0]);
  });
}

export function handleMcpGet(req: Request, siteUrl?: string): Response {
  const origin = siteOrigin(req, siteUrl);
  return new Response("Method Not Allowed — MCP server is POST-only", {
    status: 405,
    headers: { allow: "POST", "www-authenticate": challenge(origin) },
  });
}
