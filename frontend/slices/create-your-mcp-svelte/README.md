# create-your-mcp — SvelteKit

Native Svelte 5 admin UI and SvelteKit HTTP adapters over the same MCP/OAuth/PKCE core and Convex backend used by the React/Next distribution.

```bash
npx rr add create-your-mcp --framework sveltekit
```

## Admin UI

```svelte
<script lang="ts">
  import { McpAdminView } from "./frontend/slices/create-your-mcp-svelte";
  let { rows, revoke } = $props();
</script>

<McpAdminView
  siteUrl="https://app.example.com"
  {rows}
  onRevoke={(id, label) => revoke(id, label)}
/>
```

## SvelteKit routes

Create `src/routes/api/mcp/+server.ts`:

```ts
import { createSvelteKitMcpHandlers } from "../../../../frontend/slices/create-your-mcp-svelte/server";
export const { GET, POST } = createSvelteKitMcpHandlers({
  serverInfo: { name: "my-app-mcp", version: "1.0.0" },
  instructions: "Describe your domain and tool workflow here.",
});
```

Create `src/routes/api/oauth/token/+server.ts` similarly with `createSvelteKitOauthTokenHandlers()`.

The default backend reads `CONVEX_URL`, `NEXT_PUBLIC_CONVEX_URL`, or `PUBLIC_CONVEX_URL` and talks to the shared `convex/features/create_your_mcp` functions. Pass an explicit `backend` to either handler factory when your host owns the Convex client differently.

The Svelte distribution does not import React, Next, `lucide-react`, or React shadcn runtime.

Clean-install packaging includes the shared server barrel used by the SvelteKit server entrypoint, so the handler factories typecheck in a fresh consumer without repository-local files.
