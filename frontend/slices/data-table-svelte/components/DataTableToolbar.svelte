<script lang="ts" generics="TData extends RowData">
  import type { RowData } from "@tanstack/svelte-table";
  import type { DataTableLabels } from "../../data-table/lib/core";
  import type { DataTableInstance } from "../lib/table";

  type Props = {
    table: DataTableInstance<TData>;
    searchKey?: string;
    searchPlaceholder?: string;
    labels: DataTableLabels;
  };

  let { table, searchKey, searchPlaceholder, labels }: Props = $props();
  let filters = $derived(table.atoms.columnFilters.get());
  let visibility = $derived(table.atoms.columnVisibility.get());
  let searchColumn = $derived(searchKey ? table.getColumn(searchKey) : undefined);
  let searchValue = $derived.by(() => {
    void filters;
    return String(searchColumn?.getFilterValue() ?? "");
  });
  let hideableColumns = $derived.by(() => {
    void visibility;
    return table.getAllLeafColumns().filter((column) => column.getCanHide());
  });
</script>

<div class="flex items-center justify-between gap-2 py-2">
  {#if searchColumn}
    <input
      type="search"
      value={searchValue}
      oninput={(event) => searchColumn?.setFilterValue(event.currentTarget.value)}
      placeholder={searchPlaceholder ?? labels.searchPlaceholder}
      aria-label={searchPlaceholder ?? labels.searchPlaceholder}
      class="h-8 w-full max-w-xs rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  {:else}
    <span></span>
  {/if}

  <details class="relative">
    <summary
      class="flex h-8 cursor-pointer list-none items-center gap-2 rounded-md border border-input px-3 text-xs font-medium hover:bg-accent"
    >
      <span aria-hidden="true">☷</span>
      {labels.view}
    </summary>
    <div class="absolute right-0 z-20 mt-1 w-44 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
      <p class="px-2 py-1.5 text-xs font-semibold">{labels.toggleColumns}</p>
      <div class="my-1 h-px bg-border"></div>
      {#each hideableColumns as column (column.id)}
        <label class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent">
          <input
            type="checkbox"
            checked={column.getIsVisible()}
            onchange={(event) => column.toggleVisibility(event.currentTarget.checked)}
          />
          <span class="capitalize">{column.id}</span>
        </label>
      {/each}
    </div>
  </details>
</div>
