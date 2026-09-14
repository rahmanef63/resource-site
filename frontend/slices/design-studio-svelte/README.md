# Design Studio — SvelteKit

Native Svelte 5 renderer over the same portable layer model, undo/redo store,
scene state, filter/mask grammar, import/export document format, and injected
media/host adapter as the React default.

```bash
npx rr add design-studio --framework sveltekit
```

Mount `<MediaStudio />` inside a height-bearing container. The bundled image
samples keep the studio fully offline until `configureMediaStudio()` injects a
real media pool or document saver.
