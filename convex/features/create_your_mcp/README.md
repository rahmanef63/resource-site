# create-your-mcp (convex feature)

OAuth2 + PKCE authorization backend for a self-hosted MCP server. Issues
short-lived auth codes and access tokens so MCP clients (Claude, Cursor) can
connect securely.

**Tables:** `oauthCodes`, `oauthAccessTokens`
**Functions:** `query.ts`, `mutation.ts` · PKCE helpers in `_pkce.ts`

Schema composes into the root via `createYourMcpTables` in `_schema.ts`.
Part of Rahman Resources.
