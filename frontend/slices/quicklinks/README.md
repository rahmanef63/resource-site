# quicklinks — website shortcuts with favicons

A grid of user-curated website shortcuts. Each quicklink is a URL + label;
the tile favicon is derived from the URL (Google s2 host) and clicking one
opens the site in a new native browser tab (`noopener,noreferrer`).

## Mount

```tsx
import { QuicklinksApp } from "@/features/quicklinks";

// Zero wiring → localStorage-backed store seeded with demo links
<QuicklinksApp />
```

Or hand `quicklinksApp` (lazy `load`) to an appshell-style launcher.

## Host seam (`lib/host.ts`)

```ts
import { configureQuicklinks, createMemoryStore } from "@/features/quicklinks";

// Swap the default localStorage store for the host's own list:
configureQuicklinks({
  get: () => hostLinks,                      // Quicklink[] = { id, title, url }
  subscribe: (cb) => hostBus.on(cb),         // change notifications
  add: (url, title) => hostStore.add(url, title),
  remove: (id) => hostStore.remove(id),
});

// Or a controlled in-memory list (previews/tests):
configureQuicklinks(createMemoryStore([{ id: "gh", title: "GitHub", url: "https://github.com" }]));
```

Helpers: `faviconUrl(url)` (null on a bad URL), `openQuicklink(ql)`,
`normalizeUrl`, `titleFromUrl`.

## Pairs with appshell

The `appshell` slice exposes a `useQuickLinks` capability — its QuicklinkIcon
renders the same list as favicon shortcuts in the dock/launchpad. Wire BOTH
to one store (this slice's, or the host's) and this app becomes the manager
window for the shell's shortcuts.
