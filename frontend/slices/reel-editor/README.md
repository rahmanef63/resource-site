# reel-editor

In-browser video timeline editor with native React and Svelte 5 distributions over one composition/media/render core.

## Install

```bash
# React / Next default
npx rr add reel-editor

# Svelte 5 / SvelteKit
npx rr add reel-editor --framework sveltekit
```

Both renderers reuse the same immutable composition model, observable undo/redo history, `drawFrame()` Canvas-2D WYSIWYG path, `MediaCache` + audio graph, keyframes/transitions, AI transform core, filesystem adapter, draft/settings storage, and `renderToWebM()` exporter.

The native Svelte renderer includes preview/playback, layered timeline, track lock/hide/mute/reorder, clip inspector (trim/speed/reverse/audio/transitions/text/transforms), local/sample/filesystem media import, AI commands, keyboard shortcuts, autosave, settings, and WebM export. It installs only `svelte@^5` plus framework-neutral core files — no React, Next, Lucide React, shadcn, Sonner, resizable-panels, FilePicker, or shared agent runtime.

## Filesystem seam

```ts
import { configureReelFs } from "@/features/reel-editor";

configureReelFs({
  list: async (path) => ({ path, entries: [] }),
  mkdir: async (path) => {},
  rawUrl: (path) => `/api/files/raw?path=${encodeURIComponent(path)}`,
});
```

Keep path authorization and media access policy in that backend. The editor is client-side UI and does not make a local adapter a security boundary.

## Agent tools

`reelEditorTools` is a structural tool collection. React auto-registers it through the narrow shared agent hook. Svelte exposes an optional `registerTools` prop so a host can wire the same tool collection without shipping the React agent runtime.
