# file-explorer

Backend-neutral file manager with native React and Svelte 5 distributions over one `FileExplorerAdapter` contract.

## Install

```bash
# React / Next default
npx rr add file-explorer

# Svelte 5 / SvelteKit
npx rr add file-explorer --framework sveltekit
```

Both renderers cover navigation history + breadcrumbs, location sidebar, grid/list sorting, multi-select, create/rename/move/copy/cut/paste/trash/delete, file/folder upload, media/text/PDF preview, editable text + metadata properties, storage usage, and optional tool registration.

React keeps the existing shadcn/Lucide surface and auto-registers tools through the shared agent host. Svelte installs only `svelte@^5` plus framework-neutral adapter/core files; it carries no React, Next, Lucide React, shadcn, shared FilePicker, or React agent hook.

## Adapter

```ts
import type { FileExplorerAdapter } from "@/features/file-explorer";
```

Implement `list/mkdir/remove/move/copy/upload/usage/rawUrl` and optionally `readUrl/read/write/setMeta`. `mode: "readonly"` disables mutations with a notice. The bundled `createMockAdapter()` is writable and keeps uploaded bytes in memory; `createLiveAdapter()` targets an HTTP filesystem gateway; `createConvexAdapter()` is structural and does not import Convex.
