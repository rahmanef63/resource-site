# resources-launcher-admin — curated icon-launcher CRUD

An owner-gated admin app for a curated set of launcher links. Add, edit, remove
and reorder links (label / lucide icon NAME / url / group / order) that open in a
new tab. Icons are stored as lucide NAME strings and resolved to components
client-side, so the same data can drive a public launcher surface.

## Mount

```tsx
import { ResourcesAdmin } from "@/features/resources-launcher-admin";

// Zero wiring → in-memory mock store (add / edit / remove / reorder all live)
<ResourcesAdmin />
```

Or hand `resourcesAdminApp` (lazy `load`) to an appshell-style launcher.

## Host seam (`lib/host.ts`)

```ts
import { configureResources } from "@/features/resources-launcher-admin";

configureResources({
  mode: "live",
  list: () => myApi.listResources(), // open read — guests see the launcher
  upsert: (r) => myApi.upsertResource(r), // insert (no id) or patch (with id)
  remove: (id) => myApi.removeResource(id),
  canManage: () => myApi.isOwner(), // gates the editor + reorder controls
});
```

Every other file in the slice imports ONLY this seam. Omit `upsert` / `remove` /
`canManage` for a read-only view. Icon NAMEs map through `resolveIcon` /
`RESOURCE_ICONS` (see `lib/icons.ts`) — an unknown name falls back to `Link`.
