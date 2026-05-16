import { AsyncLocalStorage } from "node:async_hooks";

// Per-request MCP context. The /api/mcp route stuffs the authenticated
// bearer into here before dispatching; tool handlers read it via
// `getMcpContext()` to forward the same bearer into Convex admin calls.
//
// Uses AsyncLocalStorage so tools can be async without losing context
// when promises hop event-loop turns.

export type McpContext = {
  /** Bearer the route validated. Either an OAuth access_token (user-bound)
   *  or the static MCP_API_KEY (service-account / env-bypass). */
  token: string;
};

const storage = new AsyncLocalStorage<McpContext>();

export function runWithMcpContext<T>(ctx: McpContext, fn: () => T | Promise<T>): T | Promise<T> {
  return storage.run(ctx, fn);
}

export function getMcpContext(): McpContext {
  const ctx = storage.getStore();
  if (!ctx) {
    throw new Error(
      "getMcpContext() called outside runWithMcpContext — tool handler executed before route attached context.",
    );
  }
  return ctx;
}
