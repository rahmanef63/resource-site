# Changelog — sections

## 0.5.0 — 2026-09-15

- Fixed the canonical installer source from the nonexistent `frontend/slices/landing-sections` path to `frontend/slices/sections`.
- Added native Svelte 5/SvelteKit admin + public section renderers over the shared reducer, store, ordering, field schema, types, and config parser.
- React admin CRUD, motion, and section-heading helpers are now slice-local; no hidden `templates/_shared` dependency remains.
- Removed the React `next` runtime requirement by using standard anchors for public CTAs.
- Preserved React/Next as the default distribution and kept Svelte free of React, Lucide React, shadcn, Embla, and Next runtime dependencies.

## 0.4.0

- Canonical config-driven public renderers and admin composition surface.
