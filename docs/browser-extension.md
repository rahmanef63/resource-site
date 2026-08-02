# Browser extension + protocol (Phase 2)

Reusable packages backing the os-vps browser-agent capability. resource-site
hosts the **extension source** and the **protocol spec** as templates/docs — the
running browser service lives in os-vps (this repo is not a workspaces monorepo
and does not host the systemd unit).

## Packages

- `packages/browser-protocol` — shared TS types + `actionToRequest()`. The
  contract between the runtime, the extension, and agent clients.
- `packages/browser-extension` — MV3 extension: DOM/form scanner + selector
  actions, output identical to the runtime's `/elements` shape.

## How it fits

```
agent client ──> os-vps /api/v1/browser/* ──> os-browser runtime (Playwright)
                                                   └─ (opt-in) loads this extension
                                                      when headed + Xvfb
```

The extension is **not required** for headless operation — the runtime scans the
DOM itself. Load it (`OS_BROWSER_EXTENSION_DIR` + `OS_BROWSER_HEADLESS=0` + Xvfb)
only for interactive/headed use or richer in-page form context.

## Build / use

```bash
cd packages/browser-extension && npm i && npm run build   # → dist/ (load unpacked)
cd packages/browser-protocol && npm i && npm run typecheck
```

## Guarantees

- `scanElements()` in the extension and `scanElements` in os-vps
  `os-browser/server.mjs` produce the same `ScannedElement` fields. Change one →
  change both, and bump `rahman-browser-protocol`.
- Excluded from the repo's root `tsc`/`next build` (root tsconfig `exclude:
  packages/**`), so browser-only globals here never break the site build.
- All source files ≤200 LOC.
