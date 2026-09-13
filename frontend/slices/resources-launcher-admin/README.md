# resources-launcher-admin — curated icon-launcher CRUD

Owner-gated launcher-link CRUD with one portable adapter/core and native framework renderers. Add, edit, remove and reorder links (label / icon name / URL / group / order) that open in a new tab. The same data can drive a separate public launcher.

## React / Next (default)

```tsx
import { ResourcesAdmin } from "@/features/resources-launcher-admin";

<ResourcesAdmin />
```

The default distribution uses Lucide + shadcn. `resourcesAdminApp` remains the React/appshelly lazy descriptor.

## Svelte 5 / SvelteKit

```bash
npx rr add resources-launcher-admin --framework sveltekit
```

```svelte
<script lang="ts">
  import { ResourcesAdmin } from "@/features/resources-launcher-admin-svelte";
</script>

<ResourcesAdmin />
```

The native Svelte surface uses the same resource model, mock/live adapter, icon-name catalog, sorting/reorder helpers and management permission state without importing React, Next, Lucide or shadcn.

## Shared host seam

```ts
import { configureResources } from "@/features/resources-launcher-admin";

configureResources({
  mode: "live",
  list: () => myApi.listResources(),
  upsert: (resource) => myApi.upsertResource(resource),
  remove: (id) => myApi.removeResource(id),
  canManage: () => myApi.isOwner(),
});
```

With no wiring the bundled in-memory mock keeps add/edit/remove/reorder interactive. Omit write methods or return `false` from `canManage` for read-only mode. Stored icons stay portable string names; React resolves them through `resolveIcon`, while other frameworks may render any icon system they prefer.
