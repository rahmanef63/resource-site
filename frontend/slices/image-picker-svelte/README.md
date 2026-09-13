# image-picker — Svelte 5 / SvelteKit

Native Svelte 5 distribution for the generic image picker. It keeps the same
framework-neutral image model, gallery presets, upload/link validation,
Unsplash mapping/search adapter, focal-point math, CSS escaping, and agent tools
as the React default.

```svelte
<script lang="ts">
  import { ImagePickerButton, type ImageValue } from "@/features/image-picker-svelte";

  let image = $state<ImageValue | null>(null);
</script>

<ImagePickerButton onChange={(next) => (image = next)} />
```

For uploaded files inject `onUpload(file) => Promise<string>`. For live Unsplash
search inject `searchUnsplash`, typically from `unsplashSearchVia()` connected
to a server endpoint that owns `UNSPLASH_ACCESS_KEY`.

`ImageBanner` renders and repositions a stored `ImageValue`; keyboard ArrowUp / ArrowDown
adjusts the focal point while reposition mode is active. Global pointer handling
uses `<svelte:window>` and the banner element reference uses `{@attach}`.
