# browser — remote headless-browser chrome

Browser UI for a remote headless browser: Chrome-style tabs (each tab its own
remote page), omnibar (search-or-URL), bookmark bar, history (localStorage),
favicons with globe fallback, an AI agent-activity panel, save-screenshot, and
a frame viewport that forwards clicks / typing / keys / scroll into the remote
page (live MJPEG screencast when wired, screenshot polling otherwise).

## Mount

```tsx
import { Browser } from "@/features/browser";

<div className="h-dvh"><Browser /></div>
// Unwired → an offline canvas demo renderer fakes per-tab viewports and an
// action log, so the whole chrome works with zero backend.
```

Or hand `browserApp` (lazy `load`) to an appshell-style launcher.

## Wire a real headless browser (`lib/host.ts`)

Every adapter call carries a `tab` consumer id (`ui-1`, `ui-2`, …) so each UI
tab drives its own remote page.

```ts
import { configureBrowser, configureScreencast } from "@/features/browser";

configureBrowser({
  state: (tab) => fetch(`/api/browser/state?tab=${tab}`).then((r) => r.json()),   // { url, title }
  screenshot: (tab) =>
    fetch(`/api/browser/screenshot?tab=${tab}`).then((r) => (r.ok ? r.blob() : null)),
  act: (path, body, tab) =>                       // navigate|click|type|key|scroll|back|forward|reload
    fetch(`/api/browser/${path}?tab=${tab}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }).then((r) => r.json().catch(() => ({}))),
  // Optional (demo fallbacks otherwise):
  close: (tab) => fetch(`/api/browser/close?tab=${tab}`, { method: "POST" }).then(() => {}),
  agentLog: () => fetch("/api/browser/agent-log").then((r) => r.json()),          // AgentLogEntry[]
  saveShot: (tab) =>
    fetch(`/api/browser/save-shot?tab=${tab}`, { method: "POST" }).then((r) => r.json()), // { path }
});

// Live frames instead of polling (multipart-JPEG / MJPEG stream):
configureScreencast((tab) => `/api/browser/screencast?tab=${tab}`);
```

Hosts with a mock/live server setting can gate the chrome (otherwise it is
always live on the demo renderer):

```ts
import { configureBrowserMode } from "@/features/browser";
configureBrowserMode(() => ({ live: settings.server === "live", demo: false }));
```

Pair the endpoints with a Playwright service (one persistent context per tab
renders any site — no `X-Frame-Options` problem). **Auth those routes** — a
remote browser holds logged-in sessions; treat it like a privileged device.
