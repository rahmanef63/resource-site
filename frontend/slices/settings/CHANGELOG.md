# settings changelog

## 1.2.0 — 2026-09-14

- Added native Svelte 5/SvelteKit `account` and `appearance` distributions while keeping React/Next default.
- Extracted framework-neutral account merge helpers and section/nav core; React keeps its Lucide icon wrapper while Svelte consumes the shared catalog directly.
- `settingsPageTools` is now a self-contained structural tool collection with no hidden React/agent runtime dependency.
- Svelte account preserves async load/save, optimistic merge + rollback, controlled/internal navigation, immediate notification toggles, and optional agent-tool registration.
- Svelte appearance preserves the injected `AppearanceAdapter` groups and generic section/row/segmented/accent primitives without React/Lucide/shadcn runtime.
- Corrected README usage to pass `appearance={...}` to `AppearancePanel`.
