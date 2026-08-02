# data-table

TanStack Table v8 wrapper w/ sort + pagination + per-key localStorage state.

## Install
```bash
pnpm add @tanstack/react-table
```

## Use
```tsx
import type { ColumnDef } from "@tanstack/react-table";

type Row = { name: string; email: string };
const cols: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
];

<DataTable columns={cols} data={rows} pageSize={25} />
```

## Persist page state
```tsx
const [s, setS] = useTableState("users", { pageSize: 25 });
```

## Add filter / global search
Wire `getFilteredRowModel()` + `columnFilters` state — see TanStack docs.
