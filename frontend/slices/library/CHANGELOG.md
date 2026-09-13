# Changelog — library

## 0.3.0 — 2026-09-14

- Added native Svelte 5/SvelteKit LibraryIndex, LibraryDetail, PayloadRender, CopyButton, and UpvotePanel over the same framework-neutral types/defaults/tools and the exact same Convex library backend + seo peer.
- Extracted shared filtering/tool extraction, copy/label resolution, video source parsing, file-size formatting, and optimistic upvote transitions into `lib/core.ts`; React now consumes the same core.
- Official Svelte accessibility gate added optional `videoCaptionsUrl` to the Library model + Convex create/update validators; native video rendering exposes a captions track.
- Public `/preview/slices/library` now hosts canonical `preview.tsx`. Native Svelte source uses Runes, `$derived`, keyed each blocks, and no React/Next/shadcn runtime imports.

## 0.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `libraryTools` — search/get/upvote over injectable query/mutation bindings (`LibraryToolsCtx`).
