# publisher-clean-html — Svelte 5 / SvelteKit

Install with `npx rr add publisher-clean-html --framework sveltekit`.

React/Next remains the default. The Svelte distribution adds a native preview component while the renderer, sanitizers, CSS collector, and CSP planner are copied from the same canonical TypeScript core through framework `sharedFiles`.

```svelte
<script lang="ts">
  import { PublishPreview, publishPage } from "$lib/slices/publisher-clean-html";
  const published = publishPage(tree, registry);
</script>

<PublishPreview html={published.html} />
```

The preview uses `srcdoc` in an iframe sandboxed with `allow-same-origin` only. Sanitization and CSP behavior come from the exact same shared core as the React/Next distribution, so security logic is not forked.
