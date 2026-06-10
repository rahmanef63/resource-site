# Changelog — image-editor

## 2.1.0 — 2026-06-10

- New `compact` prop on `<ImageEditor>`: container-first layout override so a
  host can force the compact (bottom-sheet) layout from its PANE width verdict;
  omitted → falls back to the viewport-based `useIsMobile()`.
- Compact bottom sheet resizes container-relative (25–80% of the pane height,
  was viewport `vh`) — correct inside narrow desktop windows.
- Top bar scrolls horizontally at very narrow widths (`overflow-x-auto` +
  `shrink-0` buttons) instead of squeezing icons below tap-target size.
- Layers footer respects an optional `--sai-bottom` safe-area inset var
  (iOS home-pill zone in compact host shells; 0 without a host).
- a11y: explicit `aria-label`s on all color-swatch icon buttons.

## 2.0.0 — 2026-06-05

- BREAKING: replaces the v1 catalog slice with the rebuilt editor — new
  barrel surface (command registry `EDITOR_COMMANDS`/`useEditorCommands`,
  `runEditorAgent`, headless `server.ts`), tool rail + panel chrome.
- AI bridge injectable: `configureAgentStream(fn)`; AI chat is optional.
- Every file ≤200 LOC (editor-stage and store split).

## 0.2.0 — 2026-06-04

- Host coupling consolidated into `lib/host.ts` (AI stream re-export) —
  single-file swap to lift the slice (rr-prep ready).
- Metadata trio added (slice.json / README / CHANGELOG).

## 0.1.0 — 2026-06-02

- Photoshop-style layered raster editor on Konva: layers, blend modes,
  layer styles, transforms, crop/resize, brushes, adjustments, text,
  free in-browser background removal, PNG/JPEG/WebP export.
- AI function-calling command registry + in-editor chat; headless
  `server.ts` command runner for API/CLI use.
