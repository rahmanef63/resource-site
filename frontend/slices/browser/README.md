# browser — remote headless-browser chrome

Framework-parity multitab browser chrome over one injected remote-browser adapter. React/Next remains default; SvelteKit gets native Svelte 5 chrome over the same transport/session/storage/tool core.

## Default / demo

Both distributions work without a backend: the bundled demo adapter paints placeholder pages into a canvas, keeps one state per UI tab, and records a small action log. Screenshot polling drives the viewport unless a screencast stream is configured.

## Real remote browser

```ts
import { configureBrowser, configureScreencast } from "@/features/browser";

configureBrowser({
  state: (tab) => fetchState(tab),
  screenshot: (tab) => fetchScreenshot(tab),
  act: (path, body, tab) => postAction(path, body, tab),
  close: (tab) => closeRemoteTab(tab),
  agentLog: () => readBrowserLog(),
  saveShot: (tab) => saveRemoteScreenshot(tab),
});

configureScreencast((tab) => `/api/browser/screencast?tab=${tab}`);
```

The server route behind that adapter must be authenticated and authorized. Treat it like SSH: a remote browser can contain logged-in sessions and private page data.

## React / Next

```tsx
import { Browser } from "@/features/browser";

<div className="h-dvh"><Browser /></div>
```

React keeps Lucide/shadcn chrome, appshell `browserApp`, inspector seam, and automatic `browserTools` registration through the declared narrow agent-hook closure.

## SvelteKit

```bash
npx rr add browser --framework sveltekit
```

```svelte
<script lang="ts">
  import { Browser } from "@/features/browser";
</script>

<div class="h-dvh"><Browser /></div>
```

Svelte installs only `svelte@^5` plus framework-neutral browser core files. It includes multitab strip, omnibar URL/search resolution, bookmarks/history, remote-frame click/type/key/scroll forwarding, live/poll badge, host screenshot save, AI activity log, mode gate, and optional `registerTools(collection, getCtx)` host integration.

## Mode gate

```ts
import { configureBrowserMode } from "@/features/browser";
configureBrowserMode(() => ({ live: settings.server === "live", demo: false }));
```

`configureBrowser`, `configureScreencast`, and `configureBrowserMode` are observable after mount; the active session reconnects without remounting the renderer.
