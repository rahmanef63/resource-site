# Changelog

## 1.1.0 — 2026-09-15

- Added native Svelte 5/SvelteKit Design Studio while keeping React/Next as default.
- Extracted framework-neutral layer/document model, observable undo/redo store, scene state, and host/media adapter shared by both renderers.
- Svelte parity covers canvas drag/place, layers/transforms, masks/custom CSS, filters/aspect/safe-area, keyboard shortcuts, JSON/HTML import-export, and optional host persistence.
- Svelte installs only `svelte@^5` plus portable core/data files; no React/Lucide/shadcn/agent runtime leakage.
