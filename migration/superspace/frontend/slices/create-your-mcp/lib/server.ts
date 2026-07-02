import {
  RPC_ERROR,
  type JsonRpcRequest,
  type JsonRpcResponse,
  type ToolDef,
} from "./types";

// MCP protocol version + server identity. Override `serverInfo` at the
// route layer by mutating the constant returned from `defaultServerInfo`
// or by passing options to `dispatchJsonRpc`.
const PROTOCOL_VERSION = "2024-11-05";

export type ServerInfo = { name: string; version: string };
export type DispatchOptions = {
  /** Custom server name + version surfaced via initialize/serverInfo. */
  serverInfo?: ServerInfo;
  /** Instructions string returned at initialize. Optional but ChatGPT
   *  surfaces it as connector description — use it. */
  instructions?: string;
};

const DEFAULT_SERVER_INFO: ServerInfo = {
  name: "create-your-mcp",
  version: "0.1.0",
};

const ok = (id: JsonRpcRequest["id"], result: unknown): JsonRpcResponse => ({
  jsonrpc: "2.0",
  id: id ?? null,
  result,
});

const err = (
  id: JsonRpcRequest["id"],
  code: number,
  message: string,
): JsonRpcResponse => ({
  jsonrpc: "2.0",
  id: id ?? null,
  error: { code, message },
});

// Stateless JSON-RPC dispatcher. Every request is independent so we
// don't need session bookkeeping. AI clients initialise once per cold
// start and reuse the connection — if initialize fires twice we just
// answer twice.
//
// `tokenScope` is the OAuth scope claim from the bearer (null for env
// bypass / scopeless tokens). Tool handlers tagged with `requiredScope`
// are checked on tools/call.
export async function dispatchJsonRpc(
  req: JsonRpcRequest,
  tools: ToolDef[],
  tokenScope: string | null = null,
  options: DispatchOptions = {},
): Promise<JsonRpcResponse | null> {
  const id = req.id ?? null;
  // Notifications have no id — server MUST NOT respond.
  const isNotification = id === null || id === undefined;

  switch (req.method) {
    case "initialize": {
      return ok(id ?? 0, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: options.serverInfo ?? DEFAULT_SERVER_INFO,
        instructions: options.instructions ?? "MCP server — call tools/list to discover available tools.",
      });
    }

    case "notifications/initialized":
    case "notifications/cancelled":
      return null;

    case "ping":
      return isNotification ? null : ok(id, {});

    case "tools/list": {
      return ok(id, {
        tools: tools.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
          ...(t.annotations ? { annotations: t.annotations } : {}),
        })),
      });
    }

    case "tools/call": {
      const params = (req.params ?? {}) as {
        name?: string;
        arguments?: Record<string, unknown>;
      };
      const tool = tools.find((t) => t.name === params.name);
      if (!tool) {
        return err(id, RPC_ERROR.METHOD_NOT_FOUND, `Unknown tool: ${params.name}`);
      }
      // Scope enforcement — null tokenScope (env bypass / legacy
      // tokens) implicitly satisfies any scope.
      if (tool.requiredScope && tokenScope !== null) {
        const have = tokenScope.split(/\s+/);
        if (!have.includes(tool.requiredScope)) {
          return ok(id, {
            content: [
              {
                type: "text" as const,
                text: `ERROR: insufficient_scope — tool ${tool.name} requires scope "${tool.requiredScope}" but token has "${tokenScope}". Re-connect the client app and grant the missing scope.`,
              },
            ],
            isError: true,
          });
        }
      }
      try {
        const result = await tool.handler(params.arguments ?? {});
        return ok(id, result);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Tool execution failed";
        return ok(id, {
          content: [{ type: "text" as const, text: `ERROR: ${message}` }],
          isError: true,
        });
      }
    }

    default:
      if (isNotification) return null;
      return err(id, RPC_ERROR.METHOD_NOT_FOUND, `Method not found: ${req.method}`);
  }
}
