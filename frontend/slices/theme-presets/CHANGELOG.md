# Changelog — theme-presets

## 0.5.0 — 2026-09-13

- Extracted framework-neutral preset provider state into `lib/core.ts`: visitor choice → site default → host default, registry readiness, commit/clear, preview and restore.
- React `ThemePresetProvider` is now a thin `useSyncExternalStore` adapter over the shared core.
- Added native Svelte 5/SvelteKit provider, unified switcher, browser light/dark/system mode store, site-default save button and theme-color sync over the same tweakcn registry/apply/tool source.
- Replaced the duplicate public theme playground with the canonical slice preview and fixed the default React Lucide dependency declaration.

## 0.4.0

- Unified light/dark/system mode and bundled tweakcn color presets behind one React switcher/provider surface.
