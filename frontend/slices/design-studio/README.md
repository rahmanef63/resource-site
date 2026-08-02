# media-studio — photo / social design canvas

Lightweight layered studio for social-format images:

- **Tools** — move / text / rect / ellipse / sticker (V·T·R·O·S shortcuts,
  ⌘Z / ⇧⌘Z undo-redo, Delete, Escape). Click the canvas to place.
- **Layers** — text, shapes, emoji stickers, images (URL or bundled samples),
  sandboxed HTML embeds. Per layer: opacity, transform, clip masks
  (circle/star/hexagon…), custom CSS.
- **Adjust** — 7 live CSS-filter sliders + 8 named presets, social aspect
  presets (1:1 → 9:16), platform safe-area guides (TikTok/Reels/IG/YouTube).
- **History** — debounced undo+redo (~400 ms coalescing, 50 steps).
- **Export / Import** — `os-rr/layers@1` JSON doc or a standalone HTML page;
  download, copy, or re-import.

## Two ways to mount

```tsx
import { MediaStudio } from "@/features/media-studio";

// 1) Blank canvas (offline, no wiring needed)
<MediaStudio />

// 2) Load a saved document
<MediaStudio payload={{ doc: jsonString }} />
```

Or hand `mediaStudioApp` (lazy `load`) to an appshell-style launcher.

## Host seam (`lib/host.ts`)

```ts
import { configureMediaStudio } from "@/features/media-studio";

configureMediaStudio({
  // Persist exports to a real fs ("Save to host" appears in the Export modal)
  saveDoc: async (text, name, mime) => writeToHost(`~/Designs/${name}`, text),
  // Feed new image layers from your media library (bundled samples otherwise)
  imageSources: () => myLibraryUrls,
});
```

Everything else in the slice imports ONLY this seam — swapping it is the whole
integration.
