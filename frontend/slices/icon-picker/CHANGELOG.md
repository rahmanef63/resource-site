# Changelog — icon-picker

## 0.6.0 — 2026-09-15

- Added native Svelte 5/SvelteKit `DynamicIcon`, inline picker, smart popover/dialog wrapper, and skeleton.
- Shared localStorage recents/style stores and picker handlers are framework-neutral; React hooks remain thin wrappers.
- Svelte uses `@lucide/svelte` + `phosphor-svelte`, keeps legacy Lucide alias names, and ships no React/Next/shadcn/agent runtime.
- `iconPickerTools` is now a self-contained structural tool collection shared by both frameworks.

## 0.5.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `iconPickerTools` — pure catalogue search + pick via the host's onChange (`IconPickerCtx`).
