# Design Studio

Framework-parity layered photo/social editor. React/Next remains the default renderer; Svelte 5/SvelteKit is explicit.

```bash
npx rr add design-studio
npx rr add design-studio --framework sveltekit
```

Both distributions use the same framework-neutral canvas contract:

- image, text, shape, sticker, and HTML layers
- transforms, visibility, reorder, masks, custom CSS, and opacity
- filter presets + fine adjustments
- social aspect presets and platform safe-area guides
- observable debounced undo/redo state
- keyboard shortcuts and layer placement/dragging
- `os-rr/layers@1` JSON round-trip and standalone HTML export
- bundled offline image samples
- optional `configureMediaStudio({ saveDoc, imageSources })` host adapter

React keeps the existing Lucide/shadcn chrome and appshell descriptor. The Svelte distribution installs only `svelte@^5` plus portable core/data files and does not import React, Next, Lucide, shadcn, or agent runtime code.
