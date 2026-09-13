# image-picker

Generic image/wallpaper picker for React/Next (default) and native Svelte 5/SvelteKit.
The slice owns no storage backend: uploads and live Unsplash search are injected,
while Gallery, Link, curated Unsplash, focal-point positioning, and value parsing
work without backend wiring.

## React / Next (default)

```tsx
import { ImagePickerButton, type ImageValue } from "@/features/image-picker";

<ImagePickerButton
  onChange={(image: ImageValue) => save(image)}
  onUpload={upload} // optional
  searchUnsplash={searchUnsplash} // optional
/>
```

`ImageBanner` adds Change / Reposition / Remove behavior for covers and hero images.
The default React distribution uses shadcn `dialog`, `button`, `input`, Lucide, and
the shared `FilePicker` primitive.

## Svelte 5 / SvelteKit

```svelte
<script lang="ts">
  import { ImagePickerButton, type ImageValue } from "@/features/image-picker-svelte";

  let image = $state<ImageValue | null>(null);
</script>

<ImagePickerButton onChange={(next) => (image = next)} />
```

The Svelte distribution is native Runes-mode code. Its custom trigger is a snippet,
global reposition pointer handling uses `<svelte:window>`, and the banner element
reference uses `{@attach}`. It does not import React, Next, Lucide, shadcn, or the
React-only shared `FilePicker`.

## Portable semantics

Both renderers share the same `ImageValue` / `ImageField` types, tab availability,
link and upload validation, gallery presets, CSS URL escaping, focal-point math,
Unsplash result mapping/search adapter, curated Unsplash fallback, and agent tools.
`imageStyle` strips line breaks and escapes quotes/backslashes before entering a
CSS `url("...")` literal.

## Upload and Unsplash integration

`onUpload?: (file: File) => Promise<string>` should return a durable URL or file
reference. React's default Upload tab uses the copied `@/shared/ui/FilePicker`
primitive; Svelte uses the native file input surface with the same validation core.

For live Unsplash search, keep `UNSPLASH_ACCESS_KEY` server-side and provide a
search function, for example through `unsplashSearchVia("/api/unsplash")`. Without
it, the curated Unsplash set remains available.
