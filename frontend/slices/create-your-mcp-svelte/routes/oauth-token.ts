import {
  getEnvConvexMcpBackend,
  type McpBackend,
} from "../../create-your-mcp/lib/backend";
import {
  handleOauthTokenGet,
  handleOauthTokenPost,
} from "../../create-your-mcp/lib/oauth-http";

type RequestEventLike = { request: Request };

export function createSvelteKitOauthTokenHandlers(backend?: McpBackend) {
  return {
    POST: ({ request }: RequestEventLike) =>
      handleOauthTokenPost(request, backend ?? getEnvConvexMcpBackend()),
    GET: () => handleOauthTokenGet(),
  };
}
