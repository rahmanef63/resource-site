# app-store — install, create + toggle apps

Framework-parity app storefront + custom-app authoring over one browser-local registry. React/Next remains the default distribution; SvelteKit gets native Svelte 5 surfaces over the same persistence, catalog, exec adapter, and tool contract.

## React / Next

```tsx
import { AppStore, CreateApp } from "@/features/app-store";

<AppStore />
```

React keeps the appshell-compatible `appStoreApp` / `createAppApp` descriptors, Lucide/shadcn chrome, `useInstalledApps()`, and automatic `useAgentTools()` registration.

## SvelteKit

```bash
npx rr add app-store --framework sveltekit
```

```svelte
<script lang="ts">
  import { AppStore, CreateApp } from "@/features/app-store";
</script>

<AppStore />
```

The Svelte distribution installs only `svelte@^5` plus framework-neutral core files. It does not carry React, Lucide React, shadcn, Next, or the shared agent runtime. `AppStore` accepts an optional `registerTools(collection, getCtx)` host hook when you want to expose `appStoreTools` to an agent.

## Shared state

`apps-core.ts` owns the local app registry. `enabled-core.ts` owns the disabled built-in app/feature set. Both expose snapshot + subscribe functions and persist to localStorage when a browser is available. New built-ins stay enabled by default because only the disabled set is persisted.

## Runtime apps + exec

HTML apps with a full `http(s)` entry render in a sandboxed iframe. Node/Python/shell entries use the injected one-shot exec adapter:

```ts
import { configureAppStoreExec } from "@/features/app-store";

configureAppStoreExec({
  mode: "live",
  exec: { run: (cmd) => post("/api/exec", { cmd }) },
});
```

Treat that endpoint like SSH: authenticate and authorize it server-side. The default adapter is a safe demo echo.

## Tool surface

`appStoreTools` is a plain structural collection with `list`, `search`, `install`, and dangerous `uninstall`. The collection itself has no agent-runtime dependency; each host decides how to register it.
