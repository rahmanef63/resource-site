# Changelog — image-picker

## 0.4.0 — 2026-09-14

- Added native Svelte 5/SvelteKit `ImagePickerButton`, `ImagePickerDialog`, `ImageBanner`, Gallery, Upload, Link, and Unsplash surfaces over the same portable image model, presets, validation, focal-point math, CSS escaping, search adapter, and agent tools.
- Svelte implementation follows the official Svelte AI guidance: Runes mode, keyed each blocks, `$state.raw` for replace-only Unsplash result arrays, event-driven debounce/cleanup, snippets for custom trigger content, `<svelte:window>` for global pointer/keyboard listeners, and `{@attach}` for the banner element reference.
- Fixed default React installer drift: `lucide-react@^0.400.0` is now declared and the shared `components/shared/ui/FilePicker.tsx` primitive is copied. The Svelte distribution intentionally copies neither React dependency.
- Public preview now hosts canonical `preview.tsx` instead of a second cross-slice `file-upload` demo.

## 0.3.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `imagePickerTools` — search (host's Unsplash action) + pick via the host's onChange (`ImagePickerCtx`).
