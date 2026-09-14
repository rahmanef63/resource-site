# data-table — Svelte 5 / SvelteKit

Native Svelte 5 distribution of the Data Table slice. React/Next remains the
default installer on TanStack React Table v8; explicit SvelteKit installs the
official `@tanstack/svelte-table` v9 adapter plus native semantic markup.

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

<DataTable
  {columns}
  data={users}
  selectable
  searchKey="name"
  pageSize={10}
/>
```

The Svelte surface covers sorting, column-bound filtering, pagination, row
selection, column visibility, and compact/comfortable density. It imports no
React, Next, Lucide React, or React shadcn runtime.

The two framework renderers intentionally use the current official adapters
for their framework. Consumer column definitions are therefore framework-local
(`@tanstack/react-table` v8 for React, `DataTableColumn<T>` from this Svelte
slice for Svelte), while labels/density/summary semantics live in shared
`lib/core.ts`.
