# Changelog — comments


## 0.4.0 — 2026-09-13

- Added native Svelte 5/SvelteKit renderless `CommentsThread` and `CommentsAnchor` adapters while React/Next remains the default.
- Extracted `createCommentsState` so ordering, threaded nesting, open counts, CRUD forwarding, and forbidden-word validation are one framework-neutral core.
- Svelte reuses canonical `TargetRef`/comment types, `buildThread`, agent tools, and the same Convex comments backend; the public preview route now hosts canonical `preview.tsx` instead of duplicating thread seed/UI logic.

## 0.3.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `commentsTools` — list/add/resolve/remove driving the SAME `CommentsBindings` adapter useComments consumes.
