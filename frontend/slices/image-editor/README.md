# image-editor

Layered raster editor with native React and Svelte 5 distributions over one document, command, history, project and Konva render contract.

## Install

```bash
# React / Next default
npx rr add image-editor

# Svelte 5 / SvelteKit
npx rr add image-editor --framework sveltekit
```

React keeps the existing `react-konva` + shadcn UI. Svelte uses `konva` directly and reuses the same `Doc`/layer model, editor command registry, unified doc+paint undo history, project autosave/open/save format, masks, adjustments/styles, background removal, and stage export semantics.

The Svelte renderer includes move/transform, brush/eraser, mask editing, eyedropper, zoom/pan, text/shape/paint/adjustment layers, layers/properties panels, image import/export, project IO, background removal, command tools, and an optional host-injected AI runner. It carries no React, Next, react-konva, Lucide React, shadcn, FilePicker, or shared agent runtime.

## AI runner

Svelte does not fake an AI backend. Pass `runAssistant` to `ImageEditor` if your host can call a model. The runner receives the current readback, the same `EDITOR_TOOLS`, and an `invoke()` function that executes the shared command registry. Without it the AI panel shows a wiring notice while every local editor feature stays usable.
