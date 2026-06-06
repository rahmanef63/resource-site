# data-table

Generic, reusable data table built on [TanStack Table v8](https://tanstack.com/table)
and shadcn `Table`. Pass typed `columns` + `data`; sorting, search, pagination,
row selection, and column visibility are wired for you.

## Surface

| Export | Kind | Notes |
|---|---|---|
| `DataTable<TData, TValue>` | component | The full table. See props below. |
| `DataTableColumnHeader` | component | Sortable header button (asc → desc → none) with indicator. |
| `DataTableToolbar` | component | Search input + column-visibility dropdown. Rendered internally. |
| `DataTablePagination` | component | Previous/Next + "page X of Y". Rendered internally. |
| `selectionColumn<TData>()` | util | Checkbox row-selection `ColumnDef` factory (auto-prepended by `selectable`). |

## `DataTable` props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns` | `ColumnDef<TData, TValue>[]` | — | Standard TanStack column defs. |
| `data` | `TData[]` | — | Row data. |
| `density` | `"compact" \| "comfortable"` | `"comfortable"` | Row/cell padding. |
| `selectable` | `boolean` | `false` | Prepend a checkbox selection column; footer shows "n of m selected". |
| `searchKey` | `string` | — | Column id bound to the toolbar search input. Omit to hide search. |
| `searchPlaceholder` | `string` | `"Search…"` | Search input placeholder. |
| `pageSize` | `number` | `10` | Rows per page. |
| `className` | `string` | — | Wrapper class. |

## Usage

```tsx
import { DataTable, DataTableColumnHeader } from "@/features/data-table";
import type { ColumnDef } from "@tanstack/react-table";

type User = { id: string; name: string; email: string };

const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Name" /> },
  { accessorKey: "email", header: ({ column }) => <DataTableColumnHeader column={column} title="Email" /> },
];

<DataTable
  columns={columns}
  data={users}
  selectable
  searchKey="name"
  density="comfortable"
  pageSize={10}
/>;
```

Use `DataTableColumnHeader` in a column's `header` to make it sortable.
Columns without it render a plain, non-sortable label.

## Dependencies

- npm: `@tanstack/react-table` (`^8.21.0`), `lucide-react`
- shadcn primitives: `table`, `button`, `input`, `checkbox`, `dropdown-menu`
- env vars: none

## Convex tables

None — pure client component slice.

## Notes

- All state (sorting, filters, visibility, selection) is internal/uncontrolled.
  For server-side pagination, fork `DataTable.tsx` and pass `manual*` options.
- Search uses TanStack's per-column `getFilterValue` — `searchKey` must match a
  column `id` / `accessorKey`.
