# rahman-browser-extension

MV3 browser extension that scans the DOM for interactive elements and acts on
them by selector. It is the reusable companion to the **os-vps** remote browser
runtime: its scan output is the same `ScannedElement` shape the runtime's
`/elements` endpoint returns (see `rahman-browser-protocol`), so an agent can
read a page through either path and act on identical selectors.

## Why an extension at all?

The runtime already scans the DOM server-side. The extension adds value when you
want **interactive / headed** use (a human watching, a devtools panel) or richer
in-page context (forms grouped by `<form>`). It is **opt-in**: the runtime loads
it only when `OS_BROWSER_EXTENSION_DIR` points here AND Chromium runs headed
under Xvfb (`OS_BROWSER_HEADLESS=0`). Default os-vps deploys stay headless and do
not load it.

## Files

- `manifest.json` — MV3 manifest (built copy lands in `dist/`).
- `src/scanner.ts` — the canonical DOM/form scan (mirrors the runtime).
- `src/content-script.ts` — injected per page; answers scan/act over `postMessage`
  and `chrome.runtime`.
- `src/page-bridge.ts` — promise-based client for in-page/agent code.
- `src/background.ts` — MV3 service worker relaying popup/devtools → active tab.

## Build

```bash
cd packages/browser-extension
npm i
npm run build      # esbuild bundles src → flat dist/ (content-script.js IIFE +
                   # background.js ESM) + copies manifest.json
npm run typecheck  # tsc --noEmit (type-only protocol imports erase at build)
# then: load dist/ as an unpacked extension, or point OS_BROWSER_EXTENSION_DIR at it
```

Content scripts can't be ES modules, so `content-script.js` is bundled as an IIFE
(the scanner is inlined); `background.js` is ESM (the manifest's service worker is
`type: module`). Verified loading into a headed Chromium under Xvfb via the os-vps
runtime — see os-vps `docs/browser-agent-plan.md` "Extension flip runbook".

## Conventions

- Every source file is ≤200 LOC (repo modularity rule). The repo's
  `audit-file-size` validator does not scan `packages/browser-*` by default; keep
  files small regardless.
- Types come from `rahman-browser-protocol` (relative import in source) — never
  redeclare the element shape here; it must stay in lockstep with the runtime.
