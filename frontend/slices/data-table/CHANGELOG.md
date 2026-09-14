# Changelog — data-table

## 0.3.0 — 2026-09-14

- Added native Svelte 5/SvelteKit sorting, filtering, pagination, row-selection, visibility, and density UI using the official `@tanstack/svelte-table` v9 adapter.
- React/Next remains the default distribution on `@tanstack/react-table` v8 + shadcn with unchanged table behavior.
- Shared density, labels, row-summary, and page-summary semantics now live in framework-neutral `lib/core.ts`.

## 0.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `dataTableTools` — state/filter.set/sort.set/page.set/selection.clear over the live TanStack `Table` instance (Ctx).
