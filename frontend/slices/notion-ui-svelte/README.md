# Notion UI — Svelte 5 / SvelteKit

Native Svelte distribution for the three controlled Notion UI surfaces. React/Next remains the default distribution.

- `page`: page shell + native block editor, slash/markdown transforms, native HTML drag reorder and the same portable block catalog/input semantics.
- `database`: controlled database surface over the same domain model and pure engines. It renders all 11 view kinds: table, board, list, gallery, calendar, feed, chart, dashboard, form, map, timeline.
- `sidebar`: native tree navigation with collapse, rename, CRUD and drag reorder/reparent over the same portable tree projection helpers.

The Svelte renderer intentionally does not install React, Next, dnd-kit, Recharts, Lucide React or shadcn React. Host data remains callback-owned.
