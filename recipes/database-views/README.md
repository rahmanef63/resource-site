# Recipe: database-views

11 view types over a properties+rows database. Source: notion-page-clone databases.

Already at `template-base/frontend/slices/notion/slices/databases/`.

## Views

table, board, calendar, timeline, chart (bar/line/pie via Recharts), gallery, map.

## Property types (12)

text, number, select, multi_select, checkbox, date, relation, rollup, formula, files, created_time, last_edited_time.

## Filter / Sort / Group

`FilterBuilder` + `SortBuilder` UIs. Applied client-side via `.filter()` / `.sort()` for now (move server-side via Convex `withIndex` for large datasets).

## Lazy load

View components are lazy-imported per view-type for bundle size.
