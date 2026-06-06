# Install `data-table` — Data Table

> Generic TanStack Table v8 + shadcn data table: sorting, toolbar search, pagination, optional row selection, column-visibility dropdown.

📚 Knowledge base : https://resource.rahmanef.com/llms.txt
📦 Slice detail   : https://resource.rahmanef.com/slices/data-table
🧠 JSON catalog   : https://resource.rahmanef.com/api/knowledge?slice=data-table
🤖 Prompt page    : https://resource.rahmanef.com/agents/data-table

## 1. Install

```bash
npx rahman-resources add data-table
# alias: npx rr add data-table
```

## 2. What it ships

- tags: `data`, `table`, `datagrid`, `tanstack`, `sorting`, `pagination`

## 3. Wire it up

Run `npx rr add data-table`, then `npm i @tanstack/react-table`. Define `ColumnDef<TData>[]` and render `<DataTable columns data selectable searchKey="<colId>" density="comfortable" pageSize={10} />`. Wrap a column's `header` in `<DataTableColumnHeader column title="…" />` to make it sortable. `selectable` auto-prepends a checkbox column and shows "n of m selected"; `searchKey` binds the toolbar input to that column's filter. Everything else (sort/filter/visibility/page state) is internal.

## Rules of engagement

- shadcn-only UI primitives. No raw `<button>` / `<dialog>` / native date or file inputs.
- 200-line hard cap per source file (extract neighbours when over).
- All Convex queries hit an index (`.withIndex(...)`); never bare `.collect()`.
- Public mutations/queries declare `args:` validators + authz.
- Full ruleset: https://resource.rahmanef.com/best-practice
