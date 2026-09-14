# app-store — Svelte 5 / SvelteKit

Native Svelte distribution over the same local app registry, built-in enable/disable store, curated catalog, command exec adapter, and agentic tool contract as the React default.

```svelte
<script lang="ts">
  import { AppStore, CreateApp, configureAppStoreExec } from "@/features/app-store";
</script>

<AppStore />
```

`AppStore` exposes an optional `registerTools(collection, getCtx)` host hook. The distribution does not install React, Lucide React, shadcn, or the shared agent runtime.

`RuntimeApp` embeds full `https://` HTML entries and runs non-HTML command entries through `configureAppStoreExec`. The default adapter is a safe demo echo.
