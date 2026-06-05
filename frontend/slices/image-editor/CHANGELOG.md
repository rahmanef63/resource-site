# Changelog — image-editor

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
