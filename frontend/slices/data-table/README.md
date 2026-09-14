# data-table

Framework-parity sortable/filterable/paginated data table. React/Next remains
the default renderer on TanStack React Table v8 + shadcn. Explicit SvelteKit
installs native Svelte 5 UI on the official TanStack Svelte Table v9 adapter.

## React / Next

```tsx
import { DataTable, DataTableColumnHeader } from "@/features/data-table";
import type { ColumnDef } from "@tanstack/react-table";

type User = { id: string; name: string; email: string };
const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Name" /> },
  { accessorKey: "email", header: ({ column }) => <DataTableColumnHeader column={column} title="Email" /> },
];

<DataTable columns={columns} data={users} selectable searchKey="name" pageSize={10} />;
```

React keeps the existing `@tanstack/react-table` v8 API and shadcn Table,
Button, Input, Checkbox, and Dropdown Menu primitives.

## SvelteKit

```bash
npx rr add data-table --framework sveltekit
```

```svelte
<script lang="ts">
  import { DataTable, type DataTableColumn } from "@/features/data-table";

  type User = { id: string; name: string; email: string };
  const columns: DataTableColumn<User>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
  ];
  let users: User[] = $state([]);
</script>

<DataTable {columns} data={users} selectable searchKey="name" pageSize={10} />
```

The Svelte distribution uses `@tanstack/svelte-table` v9 because that is the
Svelte-5-native adapter line. It does not pull React, Next, Lucide React, or
React shadcn runtime code.

## Shared behavior

Both renderers provide sorting, column-bound search/filtering, Previous/Next
pagination, optional row selection, column visibility toggles, and
`compact | comfortable` density. `lib/core.ts` owns framework-neutral labels,
density padding, row summaries, and page summaries. Consumers may override UI
copy with `labels` without changing table mechanics.

There is no Convex backend, persistence, server-side pagination, or data-fetch
contract in this slice; consumers own their data source.
