# create-your-mcp

Turn an rr app into an MCP server for ChatGPT, Claude, Cursor, and other MCP clients. OAuth 2.1 + PKCE, bearer validation, JSON-RPC dispatch, scope-aware tools, and token persistence live in one shared core; React/Next is the default distribution and SvelteKit is an explicit native Svelte 5 distribution.

## Install

```bash
# React / Next default
npx rr add create-your-mcp

# Svelte 5 / SvelteKit
npx rr add create-your-mcp --framework sveltekit
```

Both install the same Convex backend at `convex/features/create_your_mcp`. The backend requires the `convex-auth` peer because admin list/revoke/code-mint operations call `requireAdmin`.

## Convex schema

```ts
// convex/schema.ts
import { defineSchema } from "convex/server";
import { createYourMcpTables } from "./features/create_your_mcp/_schema";

export default defineSchema({
  ...createYourMcpTables,
});
```

The server route backend uses `CONVEX_URL`, `NEXT_PUBLIC_CONVEX_URL`, or `PUBLIC_CONVEX_URL`. You can instead inject a custom `McpBackend`.

## React / Next routes

Move the default route adapters:

```bash
mv frontend/slices/create-your-mcp/routes/mcp.route.ts app/api/mcp/route.ts
mv frontend/slices/create-your-mcp/routes/oauth-token.route.ts app/api/oauth/token/route.ts
```

The adapters are thin. Authentication, JSON-RPC, token exchange, and error behavior live in `lib/mcp-http.ts` and `lib/oauth-http.ts`, both based on standard Web `Request` / `Response`.

## SvelteKit routes

Create `src/routes/api/mcp/+server.ts`:

```ts
import { createSvelteKitMcpHandlers } from "../../../../frontend/slices/create-your-mcp-svelte/server";

export const { GET, POST } = createSvelteKitMcpHandlers({
  serverInfo: { name: "my-app-mcp", version: "1.0.0" },
  instructions: "Describe your domain, workflow, and tool constraints.",
});
```

Create `src/routes/api/oauth/token/+server.ts`:

```ts
import { createSvelteKitOauthTokenHandlers } from "../../../../../frontend/slices/create-your-mcp-svelte/server";
export const { GET, POST } = createSvelteKitOauthTokenHandlers();
```

Pass `backend` to either factory when your host owns Convex setup differently.

## Admin UI

Both framework renderers accept the same data contract:

- `rows: McpTokenRow[] | undefined`
- `siteUrl: string`
- `defaultClientId?: string`
- `onRevoke(id, label)`
- `setupFields?: SetupField[]`

React exports `McpAdminView` from the default slice. Svelte exports a native `.svelte` `McpAdminView` from `create-your-mcp-svelte`. The host remains responsible for fetching `adminList` and calling `revokeToken` through its authenticated Convex client.

## Environment

| Var | Scope | Required | Notes |
|---|---|---:|---|
| `MCP_API_KEY` | server | no | Static bearer for service-account / CI. Min 32 chars. |
| `MCP_OAUTH_ALLOWED_HOSTS` | Convex | no | CSV redirect host allowlist. Empty = localhost only. |
| `MCP_OAUTH_ALLOWED_PATH_PREFIXES` | Convex | no | Optional redirect path-prefix allowlist. |
| `NEXT_PUBLIC_SITE_URL` | host | yes | Public origin for discovery/setup. MCP GET/401 can fall back to request origin. |

The CLI prints `NEXT_PUBLIC_SITE_URL` exactly once; already-prefixed `next-public` names are not prefixed again.

## OAuth flow

1. Client opens `/oauth/authorize` with PKCE S256 parameters.
2. An authenticated admin approves and Convex mints a five-minute single-use code.
3. Client posts the code + verifier to `/api/oauth/token`.
4. Convex deletes the code before issuing a one-year bearer token.
5. Client calls `/api/mcp` with `Authorization: Bearer …`.
6. `tools/call` checks any `requiredScope` before invoking the tool.

`MCP_API_KEY` is a separate service-account path and does not appear in the token table.

## Add tools

```ts
import type { ToolDef } from "./frontend/slices/create-your-mcp/lib/types";
import { getMcpContext } from "./frontend/slices/create-your-mcp/lib/context";

export const postsList: ToolDef = {
  name: "posts_list",
  description: "List posts",
  inputSchema: { type: "object", properties: {} },
  annotations: { readOnlyHint: true },
  requiredScope: "cms.read",
  async handler() {
    const { token } = getMcpContext();
    return { content: [{ type: "text", text: `authenticated: ${Boolean(token)}` }] };
  },
};
```

Pass custom tools through `createSvelteKitMcpHandlers({ tools })` or edit the `TOOLS` list in the Next adapter.

## Security contract

- authorization codes and access tokens are stored as SHA-256 digests, never raw credentials;
- PKCE S256 only;
- codes are deleted on exchange, so replay becomes an opaque `invalid_grant`;
- redirect host/path allowlists are env-configured;
- `userinfo` and URL fragments are rejected;
- HTTPS redirects are required outside localhost development;
- static-key comparison is constant-time for equal-length values;
- admin list/revoke/code mint are gated by Convex `requireAdmin`;
- scope-tagged tools cannot be called by an OAuth token missing the required scope.

## Shared vs framework-specific

Shared: auth, hashing, JSON-RPC dispatcher, Web HTTP handlers, Convex HTTP backend, request context, tool types/example, admin row/setup helpers, and `convex/features/create_your_mcp`.

Framework-specific: React/Svelte admin renderers and thin Next/SvelteKit route adapters only.
