<script lang="ts" generics="TData extends RowData">
  import type { RowData } from "@tanstack/svelte-table";
  import {
    dataTablePageSummary,
    dataTableRowSummary,
    type DataTableLabels,
  } from "../../data-table/lib/core";
  import type { DataTableInstance } from "../lib/table";

  type Props = {
    table: DataTableInstance<TData>;
    selectable?: boolean;
    labels: DataTableLabels;
  };

  let { table, selectable = false, labels }: Props = $props();
  let pagination = $derived(table.atoms.pagination.get());
  let filters = $derived(table.atoms.columnFilters.get());
  let selection = $derived(table.atoms.rowSelection.get());
  let filteredCount = $derived.by(() => {
    void filters;
    return table.getFilteredRowModel().rows.length;
  });
  let selectedCount = $derived.by(() => {
    void selection;
    void filters;
    return table.getFilteredSelectedRowModel().rows.length;
  });
  let pageCount = $derived.by(() => {
    void pagination;
    void filters;
    return table.getPageCount();
  });
</script>

<div class="flex flex-wrap items-center justify-between gap-3 px-1 py-2">
  <div class="text-xs text-muted-foreground">
    {dataTableRowSummary(filteredCount, selectedCount, selectable, labels)}
  </div>
  <div class="flex flex-wrap items-center gap-3">
    <span class="text-xs font-medium text-muted-foreground">
      {dataTablePageSummary(pagination.pageIndex, pageCount, labels)}
    </span>
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="h-8 rounded-md border border-input px-3 text-xs font-medium hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
        onclick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        ← {labels.previous}
      </button>
      <button
        type="button"
        class="h-8 rounded-md border border-input px-3 text-xs font-medium hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
        onclick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        {labels.next} →
      </button>
    </div>
  </div>
</div>
