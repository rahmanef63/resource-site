# browser — Svelte 5 / SvelteKit

Native Svelte browser chrome over the same injected `BrowserAdapter`, offline canvas demo, multitab session, screenshot polling / MJPEG screencast fallback, URL helpers, local bookmarks/history, and `browserTools` as the React default.

```svelte
<script lang="ts">
  import { Browser, configureBrowser, configureScreencast } from "@/features/browser";
</script>

<div class="h-dvh"><Browser /></div>
```

`Browser` accepts an optional `registerTools(collection, getCtx)` host callback. No React, Lucide React, shadcn, Next, or shared agent runtime is included in this distribution.

For a real browser, `configureBrowser({ state, screenshot, act, close, agentLog, saveShot })` must point at an authenticated/authorized server-side browser service. Never expose a remote browser control endpoint without access control: its page can hold logged-in sessions. `configureScreencast(tab => url)` is optional; screenshot polling remains the fallback.
