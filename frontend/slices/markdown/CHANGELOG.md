# Changelog — markdown

## 0.4.0 — 2026-09-15

- Added a native Svelte 5 / SvelteKit distribution with Read, Write, Review, block-anchored comments, Mermaid, KaTeX, tables/toggles/lists, and native SVG bar/line/area/pie charts.
- Shared the parser, inline tokenizer, tab model, editor snippets, comment model, list grouping, and chart-spec parser across React and Svelte.
- Hardened React clean-install portability by removing `next/link`, `next/dynamic`, repo-only `defineFeature`, and `@/lib/utils` dependencies.
- React keeps lazy Recharts; Svelte intentionally excludes Recharts/Lucide/shadcn/React runtime and installs only `svelte`, `katex`, and `mermaid`.

## 0.3.1 — 2026-06-10

- perf: KaTeX (~280kB) now lazy-loads on first math render via `lib/katex-lazy.tsx` (`MathSpan`), mirroring the MermaidBlock pattern. Raw TeX shows as code until the module lands, then upgrades in place. No API change.

## 0.3.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `markdownTools` — pure parse/toc over the slice's own parser (empty ctx).
