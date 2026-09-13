# quicklinks — website shortcuts with favicons

A grid of user-curated website shortcuts. Each quicklink is a URL + label;
the tile favicon is derived from the URL (Google s2 host) and clicking one
opens the site in a new native browser tab (`noopener,noreferrer`).

The store, localStorage hydration, URL normalization, favicon lookup, and open
semantics live in the framework-neutral `lib/core.ts`. React/Next stays the
default distribution; Svelte 5/SvelteKit reuses that same core.

## React / Next (default)

```tsx
import { QuicklinksApp } from "@/features/quicklinks";

// Zero wiring → localStorage-backed store seeded with demo links
<QuicklinksApp />
```

Or hand `quicklinksApp` (lazy `load`) to an appshell-style launcher.

## Svelte 5 / SvelteKit

```svelte
<script lang="ts">
  import { QuicklinksApp } from "@/features/quicklinks-svelte";
</script>

<QuicklinksApp />
```

Install with:

```bash
npx rr add quicklinks --framework sveltekit
```

The Svelte distribution carries only its native component/store adapter plus
`lib/core.ts` as a verified shared file; it does not install React, Lucide, or
shadcn UI dependencies.

## Host seam

```ts
import { configureQuicklinks, createMemoryStore } from "@/features/quicklinks";

configureQuicklinks({
  get: () => hostLinks,
  subscribe: (cb) => hostBus.on(cb),
  add: (url, title) => hostStore.add(url, title),
  remove: (id) => hostStore.remove(id),
});

configureQuicklinks(createMemoryStore([{ id: "gh", title: "GitHub", url: "https://github.com" }]));
```

Helpers: `faviconUrl(url)` (null on a bad URL), `openQuicklink(ql)`,
`normalizeUrl`, `titleFromUrl`, and `getQuicklinksStore`.

## Pairs with appshell

The `appshell` slice exposes a `useQuickLinks` capability — its QuicklinkIcon
renders the same list as favicon shortcuts in the dock/launchpad. Wire both to
one store and this app becomes the manager window for the shell's shortcuts.
