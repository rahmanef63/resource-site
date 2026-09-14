# Changelog — vector-search

## 0.3.0 — 2026-09-14

- Reframed the slice as the framework-neutral adapter it actually ships: `VectorSearchCtx` + `vectorSearchTools` + compile-time config.
- Removed the React placeholder search page plus nonexistent `convex/features/search`, vector table/index, OpenAI env, shadcn, and `@convex-dev/vector-search` distribution claims.
- React/Next remains the default install contract; explicit Svelte/SvelteKit copies the exact same TypeScript source with no framework runtime dependency.
- Agentic imports now use framework-neutral `define` / `schema` modules directly.

## 0.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `vectorSearchTools` — query + server-gated index/reindex over injectable `VectorSearchCtx` (OPENAI key stays server-side).
