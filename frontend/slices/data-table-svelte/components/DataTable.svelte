<script lang="ts" generics="TData extends RowData">
  import { untrack } from "svelte";
  import { createTable, FlexRender, type RowData } from "@tanstack/svelte-table";
  import {
    dataTableCellPadding,
    resolveDataTableLabels,
    type DataTableDensity,
    type DataTableLabels,
  } from "../../data-table/lib/core";
  import DataTablePagination from "./DataTablePagination.svelte";
  import DataTableToolbar from "./DataTableToolbar.svelte";
  import { dataTableFeatures, type DataTableColumn } from "../lib/table";

  type Props = {
    columns: DataTableColumn<TData>[];
    data: TData[];
    density?: DataTableDensity;
    selectable?: boolean;
    searchKey?: string;
    searchPlaceholder?: string;
    pageSize?: number;
    labels?: Partial<DataTableLabels>;
    class?: string;
  };

  let {
    columns,
    data,
    density = "comfortable",
    selectable = false,
    searchKey,
    searchPlaceholder,
    pageSize = 10,
    labels,
    class: className = "",
  }: Props = $props();

  const table = createTable({
    features: dataTableFeatures,
    get data() {
      return data;
    },
    get columns() {
      return columns;
    },
    get enableRowSelection() {
      return selectable;
    },
    initialState: { pagination: { pageIndex: 0, pageSize: untrack(() => pageSize) } },
  });

  let resolvedLabels = $derived(resolveDataTableLabels(labels));
  let cellPadding = $derived(dataTableCellPadding(density));
  let state = $derived(table.store.get());
  let headerGroups = $derived.by(() => {
    void state;
    return table.getHeaderGroups();
  });
  let rows = $derived.by(() => {
    void state;
    return table.getRowModel().rows;
  });
  let allPageSelected = $derived.by(() => {
    void state;
    return table.getIsAllPageRowsSelected();
  });
  let somePageSelected = $derived.by(() => {
    void state;
    return table.getIsSomePageRowsSelected();
  });
</script>

<div class={`w-full ${className}`.trim()}>
  <DataTableToolbar
    {table}
    {searchKey}
    {searchPlaceholder}
    labels={resolvedLabels}
  />

  <div class="overflow-x-auto rounded-md border">
    <table class="w-full caption-bottom text-sm">
      <thead class="[&_tr]:border-b">
        {#each headerGroups as headerGroup (headerGroup.id)}
          <tr class="border-b transition-colors">
            {#if selectable}
              <th class={`h-10 px-2 text-left align-middle ${cellPadding}`}>
                <button
                  type="button"
                  role="checkbox"
                  aria-label={resolvedLabels.selectAllRows}
                  aria-checked={somePageSelected && !allPageSelected ? "mixed" : allPageSelected}
                  class="inline-grid size-4 place-items-center rounded border border-input text-[10px]"
                  onclick={() => table.toggleAllPageRowsSelected(!allPageSelected)}
                >
                  {allPageSelected ? "✓" : somePageSelected ? "−" : ""}
                </button>
              </th>
            {/if}
            {#each headerGroup.headers as header (header.id)}
              <th class={`h-10 px-2 text-left align-middle font-medium text-foreground ${cellPadding}`}>
                {#if !header.isPlaceholder}
                  {#if header.column.getCanSort()}
                    <button
                      type="button"
                      class="-ml-2 inline-flex h-7 items-center gap-1 rounded px-2 text-xs font-medium hover:bg-accent"
                      onclick={header.column.getToggleSortingHandler()}
                    >
                      <FlexRender header={header} />
                      <span aria-hidden="true" class:opacity-50={!header.column.getIsSorted()}>
                        {header.column.getIsSorted() === "asc"
                          ? "↑"
                          : header.column.getIsSorted() === "desc"
                            ? "↓"
                            : "↕"}
                      </span>
                    </button>
                  {:else}
                    <FlexRender header={header} />
                  {/if}
                {/if}
              </th>
            {/each}
          </tr>
        {/each}
      </thead>
      <tbody class="[&_tr:last-child]:border-0">
        {#if rows.length}
          {#each rows as row (row.id)}
            <tr class="border-b transition-colors hover:bg-muted/50" data-state={row.getIsSelected() ? "selected" : undefined}>
              {#if selectable}
                <td class={`px-2 align-middle ${cellPadding}`}>
                  <input
                    type="checkbox"
                    aria-label={resolvedLabels.selectRow}
                    checked={row.getIsSelected()}
                    onchange={(event) => row.toggleSelected(event.currentTarget.checked)}
                  />
                </td>
              {/if}
              {#each row.getVisibleCells() as cell (cell.id)}
                <td class={`px-2 align-middle ${cellPadding}`}>
                  <FlexRender {cell} />
                </td>
              {/each}
            </tr>
          {/each}
        {:else}
          <tr>
            <td
              colspan={columns.length + (selectable ? 1 : 0)}
              class="h-24 px-2 text-center text-sm text-muted-foreground"
            >
              {resolvedLabels.noResults}
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>

  <DataTablePagination {table} {selectable} labels={resolvedLabels} />
</div>
