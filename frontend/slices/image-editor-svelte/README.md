# image-editor — Svelte 5 / SvelteKit

Native Svelte 5 layered raster editor over the same document model, command registry, history, project IO, adjustment/style semantics, background removal, and Konva export stage as the React default.

```svelte
<script lang="ts">
  import { ImageEditor } from "@/features/image-editor";
</script>

<ImageEditor />
```

The Svelte renderer uses `konva` directly (not `react-konva`) and includes layer add/select/reorder/duplicate/delete, move/transform, brush/eraser, mask painting, eyedropper, zoom/pan, text/shape/paint/adjustment layers, blend/opacity/adjustments/styles, project autosave/open/save, image import/export, background removal, command tools, and an optional host-injected AI runner.

Svelte installs no React, Next, react-konva, Lucide React, shadcn, FilePicker, or shared agent runtime. AI is explicit: pass `runAssistant` or the panel shows a wiring notice while every non-AI editor feature remains usable.
