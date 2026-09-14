import {
  getEnvConvexMcpBackend,
  type McpBackend,
} from "../../create-your-mcp/lib/backend";
import {
  handleMcpGet,
  handleMcpPost,
  type McpHttpOptions,
} from "../../create-your-mcp/lib/mcp-http";
import { exampleTools } from "../../create-your-mcp/lib/tools/example";

export type SvelteMcpRouteOptions = Omit<McpHttpOptions, "backend" | "tools"> & {
  backend?: McpBackend;
  tools?: McpHttpOptions["tools"];
};

type RequestEventLike = { request: Request };

export function createSvelteKitMcpHandlers(options: SvelteMcpRouteOptions = {}) {
  const resolve = (): McpHttpOptions => ({
    ...options,
    backend: options.backend ?? getEnvConvexMcpBackend(),
    tools: options.tools ?? exampleTools,
  });
  return {
    POST: ({ request }: RequestEventLike) => handleMcpPost(request, resolve()),
    GET: ({ request }: RequestEventLike) => handleMcpGet(request, options.siteUrl),
  };
}
