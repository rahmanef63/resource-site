# media-studio changelog

## 1.0.0 — 2026-06-10

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  `configureMediaStudio({ saveDoc, imageSources })` injects fs persistence +
  a real media library; inspector bus inert outside a shell.
- New studio root (`app.tsx`) wires the formerly shell-bound component tree
  (tool rail, canvas stage, side panel, export modal) into one offline app.
- Offline demo media: bundled SVG data-URI samples feed new image layers.
- shadcn-only conversion: raw buttons → `Button`, os-shell `FormDrawer` →
  `Dialog`, file input → shared `FilePicker`; slice-local `Slider`/`Segmented`.
- Dropped (os-vps-only): the `@/features/image-editor` wrapper, VPS save
  dialog (`/api/v1/fs/upload`), shell close-guard + toast bus.
