# Changelog — dashboard-shell

## 1.3.0 — 2026-09-15

- Added an explicit native Svelte 5 / SvelteKit distribution for `DashboardShell`, `DashboardSidebar`, `MobileDock`, and `MobileMenuDrawer`.
- Extracted framework-neutral nav/core types so React and Svelte share active-path, flattening, dock derivation, and active-title semantics.
- Svelte uses `$app/state`, `$derived`, snippets, keyed loops, and CSS breakpoints with no React/Next/Lucide/Vaul/shadcn runtime dependency.
- Corrected the React installer metadata to include the existing `vaul` + drawer dependency alongside Lucide/shadcn.
- Public preview route now hosts the canonical `preview.tsx` module instead of maintaining a second demo nav/render flow.
