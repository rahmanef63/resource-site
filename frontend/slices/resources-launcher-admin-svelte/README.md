# resources-launcher-admin — Svelte 5 / SvelteKit

Native Svelte admin for the same portable resource adapter used by the React default distribution.

```svelte
<script lang="ts">
  import { ResourcesAdmin, configureResources } from "@/features/resources-launcher-admin-svelte";

  configureResources({
    mode: "live",
    list: () => api.listResources(),
    upsert: (resource) => api.upsertResource(resource),
    remove: (id) => api.removeResource(id),
    canManage: () => api.isOwner(),
  });
</script>

<ResourcesAdmin />
```

With no host wiring the bundled in-memory adapter keeps add, edit, delete and reorder interactive. The Svelte distribution renders stored icon names without importing React, Next, Lucide or shadcn; hosts can replace that visual treatment while keeping the same data contract.
