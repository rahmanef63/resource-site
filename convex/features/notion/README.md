# notion — whole-doc persistence for the notion hosts

Backend half of the dashboard **Notes** (notion-shell page editor) and
**Database** (notion-database 11-view surface) pages used across the
template fleet.

| File | What |
|---|---|
| `_schema.ts` | `notionTables` — `notion_docs` {slug, kind: "page"\|"database", data, updatedAt}, index `by_slug`. |
| `query.ts` | `get({slug})` — auth-gated read; null for anon (host falls back to seed). |
| `mutation.ts` | `save({slug, kind, data})` — auth-gated whole-doc upsert (debounced by `useNotionDoc`). |

Single-owner admin tooling → whole-JSON-blob per slug, last-write-wins.
Frontend hosts live at `components/templates/_shared/notion/`.
