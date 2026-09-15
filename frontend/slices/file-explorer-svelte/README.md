# file-explorer — Svelte 5 / SvelteKit

Native Svelte 5 renderer over the same backend-neutral `FileExplorerAdapter` contract as the React default.

```svelte
<script lang="ts">
  import { FileExplorer, createMockAdapter } from "@/features/file-explorer";
  const adapter = createMockAdapter();
</script>

<FileExplorer {adapter} initialPath="/" />
```

Included behavior: location sidebar, back/forward + breadcrumbs, grid/list + sort, multi-select, create/rename/move/copy/cut/paste/trash/delete, drag/drop and picker upload, inline image/audio/video/PDF/text preview, editable text + metadata properties, storage usage, and optional tool registration.

The Svelte distribution ships no React, Next, Lucide React, shadcn, or shared agent runtime. Inject any adapter structurally, or use the bundled mock/live/Convex adapter factories.
