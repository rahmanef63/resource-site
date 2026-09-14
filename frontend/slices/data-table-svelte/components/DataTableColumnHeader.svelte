<script lang="ts" generics="TData extends RowData">
  import type { RowData } from "@tanstack/svelte-table";
  import type {
    DataTableColumnInstance,
    DataTableInstance,
  } from "../lib/table";

  type Props = {
    table: DataTableInstance<TData>;
    column: DataTableColumnInstance<TData>;
    title: string;
    class?: string;
  };

  let { table, column, title, class: className = "" }: Props = $props();
  let sorting = $derived(table.atoms.sorting.get());
  let sorted = $derived.by(() => {
    void sorting;
    return column.getIsSorted();
  });
</script>

{#if column.getCanSort()}
  <button
    type="button"
    class={`-ml-2 inline-flex h-7 items-center gap-1 rounded px-2 text-xs font-medium hover:bg-accent ${className}`}
    onclick={column.getToggleSortingHandler()}
    aria-label={`${title}: ${sorted || "unsorted"}`}
  >
    <span>{title}</span>
    <span aria-hidden="true" class:opacity-50={!sorted}>
      {sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : "↕"}
    </span>
  </button>
{:else}
  <div class={`text-xs font-medium ${className}`}>{title}</div>
{/if}
