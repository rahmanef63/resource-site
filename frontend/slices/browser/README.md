# browser — remote headless-browser chrome

Browser UI for a remote headless browser: omnibar (search-or-URL), bookmark
bar, history (localStorage), favicons with globe fallback, and a screenshot
viewport that forwards clicks / typing / keys / scroll into the remote page.

## Mount

```tsx
import { Browser } from "@/features/browser";

<div className="h-dvh"><Browser /></div>
// Unwired → an offline canvas demo renderer fakes the viewport, so the
// whole chrome works with zero backend.
```

Or hand `browserApp` (lazy `load`) to an appshell-style launcher.

## Wire a real headless browser (`lib/host.ts`)

```ts
import { configureBrowser } from "@/features/browser";

configureBrowser({
  state: () => fetch("/api/browser/state").then((r) => r.json()),          // { url, title }
  screenshot: () => fetch("/api/browser/screenshot").then((r) => (r.ok ? r.blob() : null)),
  act: (path, body) =>                                                     // navigate|click|type|key|scroll|back|forward|reload
    fetch(`/api/browser/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }).then((r) => r.json().catch(() => ({}))),
});
```

Pair the endpoints with a Playwright service (one persistent context renders
any site — no `X-Frame-Options` problem). **Auth those routes** — a remote
browser holds logged-in sessions; treat it like a privileged device.
