# Changelog

## 0.4.0 — 2026-09-15

- Added native Svelte 5/SvelteKit `shell` and `console` distributions while keeping React/Next as default.
- Shared access rules, 26-section catalog, mock contracts, registry stats, and `?section=` deep-link semantics across renderers.
- Svelte console includes the five owned sections and accepts Svelte snippets for peer/provider sections without React/Lucide/shadcn leakage.
- Variant installs keep Convex/env boundaries exact: shell → `convex/features/admin` + `SUPER_ADMIN_EMAIL`; console → `convex/features/admin_console` + `PLATFORM_ADMIN_EMAILS`.
