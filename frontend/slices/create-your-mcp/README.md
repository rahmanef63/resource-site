# create-your-mcp

Turn any rr-based app into an MCP server that ChatGPT custom apps,
Claude.ai connectors, Cursor MCP, and other AI clients authenticate to
via OAuth 2.1 + PKCE.

## Install

```bash
npx rr add create-your-mcp
```

CLI copies:

- `slices/create-your-mcp/` — config, types, lib, route templates, admin view
- `convex/features/create-your-mcp/` — schema + PKCE + mutations + queries

Compose the schema:

```ts
// convex/schema.ts
import { defineSchema } from "convex/server";
import { createYourMcpTables } from "./features/create-your-mcp/_schema";

export default defineSchema({
  ...createYourMcpTables,
  // … your other tables
});
```

## Wire the Next.js routes

Move the two route templates out of the slice into your `app/api/` tree:

```bash
mv slices/create-your-mcp/routes/mcp.route.ts        app/api/mcp/route.ts
mv slices/create-your-mcp/routes/oauth-token.route.ts app/api/oauth/token/route.ts
```

In `app/api/mcp/route.ts`, replace the placeholder import + `TOOLS` array
with your real tools and Convex client. Each tool implements `ToolDef`
from `@/features/create-your-mcp/lib/types`.

## Env

| Var | Scope | Required | Notes |
|---|---|---|---|
| `MCP_API_KEY` | server | optional | Static bearer for service-account / CI. Min 32 chars. Must match Convex `MCP_API_KEY` env. |
| `MCP_OAUTH_ALLOWED_HOSTS` | convex | optional | CSV of vendor domains accepted as `redirect_uri` (e.g. `chatgpt.com,claude.ai`). Empty = localhost only. |
| `MCP_OAUTH_ALLOWED_PATH_PREFIXES` | convex | optional | CSV of path prefixes (e.g. `/aip/,/connector/`). Empty = any path under allowed hosts. |
| `NEXT_PUBLIC_SITE_URL` | next-public | required | Used in the `WWW-Authenticate` challenge. |

Set on both sides:

```bash
# Convex
npx convex env set MCP_OAUTH_ALLOWED_HOSTS chatgpt.com,claude.ai,cursor.sh
npx convex env set MCP_OAUTH_ALLOWED_PATH_PREFIXES /aip/,/connector/,/backend-api/,/oauth/
npx convex env set MCP_API_KEY $(openssl rand -hex 32)

# Next host (Vercel / Dokploy / etc.)
MCP_API_KEY=<same value>
NEXT_PUBLIC_SITE_URL=https://your-app.example.com
```

## Connect an AI client

Mount `<McpAdminView />` somewhere admin-gated (e.g. `app/admin/mcp/page.tsx`).
The collapsible "Setup an AI client" panel renders copy-buttons for every
field a connector form asks for.

ChatGPT custom-app flow (same shape for Claude.ai connector + Cursor MCP):

1. ChatGPT → Settings → Connectors → New
2. Authentication = OAuth
3. Paste values from the admin view (Server URL, Auth URL, Token URL, Resource, Client ID)
4. ChatGPT opens `/oauth/authorize?...` — admin sees consent screen, clicks Allow
5. Convex mints a single-use code (5-min TTL) → ChatGPT exchanges for a bearer (1-year TTL)
6. Every `tools/call` from ChatGPT hits `/api/mcp` with `Authorization: Bearer <token>`

## Two authentication paths

| Path | When | Notes |
|---|---|---|
| OAuth bearer | AI client connectors (ChatGPT, Claude, Cursor) | User-bound. Visible + revocable in the admin view. |
| `MCP_API_KEY` env | Service accounts, smoke tests, CI scripts | Not visible in the admin view. Rotate by changing the env on both Convex + Next host. |

Both paths flow through `requireAdmin` server-side — Convex mutations
cannot bypass admin auth either way. The env path is documented as a
service-account integration pattern, not a security back door.

## Security notes

- PKCE S256 only (downgrade to "plain" is rejected)
- Single-use codes — `consumed` flag patched BEFORE token mint
- 5-min code TTL, 1-year token TTL (rotate via `revokeToken` on leak)
- Constant-time token compare
- Opaque error collapse on all `invalid_grant` paths — attacker can't
  distinguish which step (unknown / consumed / expired / PKCE / redirect /
  client) failed
- Redirect-URI allowlist (env-configured) + path-prefix allowlist for
  defense-in-depth against open-redirect bounces
- `userinfo` and `fragment` rejected in redirect_uri
- HTTPS-only redirects in prod (localhost exception for dev)
- Token preview only on admin wire (raw token never leaves Convex)

## Add tools

```ts
// app/api/mcp/route.ts
import type { ToolDef } from "@/features/create-your-mcp/lib/types";
import { getMcpContext } from "@/features/create-your-mcp/lib/context";

const blogPostsList: ToolDef = {
  name: "blog_posts_list",
  description: "List the most recent blog posts.",
  inputSchema: {
    type: "object",
    properties: { limit: { type: "number", default: 20 } },
  },
  annotations: { readOnlyHint: true },
  requiredScope: "cms.read",
  async handler({ limit = 20 }) {
    const { token } = getMcpContext();
    const rows = await convexHttp.query("blog:list", { limit, token });
    return { content: [{ type: "text", text: JSON.stringify(rows) }] };
  },
};

const TOOLS: ToolDef[] = [...exampleTools, blogPostsList];
```

Tools with `requiredScope` are gated against the bearer's `scope` claim —
read-only tokens can't escalate to mutations.

## See also

- MCP spec: <https://modelcontextprotocol.io/specification/2025-11-25>
- OAuth 2.1: <https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1>
- PKCE: <https://datatracker.ietf.org/doc/html/rfc7636>
