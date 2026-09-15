# reel-editor — Svelte 5 / SvelteKit

Native Svelte 5 video timeline editor over the same immutable composition, undo/redo, Canvas-2D draw path, MediaCache/audio graph, WebM renderer, AI transforms, settings/draft, and filesystem adapter cores as the React default.

```svelte
<script lang="ts">
  import { ReelEditor } from "@/features/reel-editor";
</script>

<ReelEditor />
```

The Svelte renderer includes preview/playback, layered timeline + playhead, track controls, clip inspector (trim/speed/reverse/audio/transitions/text/transforms), media/sample/file import, AI command panel, settings, keyboard shortcuts, autosave, undo/redo, and client-side WebM export using the same `drawFrame()` path as preview.

No React, Next, Lucide React, shadcn, Sonner, resizable-panels, FilePicker, or shared agent runtime is installed. Hosts may inject `registerTools()` and `configureReelFs()` explicitly.
