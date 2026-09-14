# create-your-mcp changelog

## 0.4.0 — 2026-09-14

- Added explicit native Svelte 5/SvelteKit distribution while keeping React/Next as the default.
- Extracted MCP and OAuth token HTTP behavior to Web `Request` / `Response` cores shared by both frameworks.
- Replaced the undeclared `@/shared/lib/convex-http` route dependency with an installed `ConvexHttpClient` backend adapter.
- Corrected install metadata: Convex backend path uses `create_your_mcp`, React declares `convex`, `class-variance-authority`, and shadcn `button`; Svelte declares only `svelte` + `convex`.
- Corrected the CLI display path that previously printed `NEXT_PUBLIC_NEXT_PUBLIC_SITE_URL` for an already-prefixed `next-public` env name.

## 0.3.0

- OAuth 2.1 + PKCE flow, hashed single-use authorization codes, hashed access tokens, scope-aware MCP tools, admin token view, and static `MCP_API_KEY` fallback.
