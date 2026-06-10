// Agentic tool collection. The slice is NOT an agent — it exports tools a
// shared agent host drives. Ctx = the live TanStack Table instance the host
// page owns (register with `useAgentTools(dataTableTools, table)`).

import type { Table } from "@tanstack/react-table";
import { defineToolCollection, bool, noArgs, num, obj, str } from "@/shared/agentic";

export type DataTableCtx = Table<unknown>;

const state = (t: DataTableCtx): string => {
  const s = t.getState();
  return `rows=${t.getFilteredRowModel().rows.length} page=${s.pagination.pageIndex + 1}/${t.getPageCount()} sort=${s.sorting.map((x) => `${x.id}${x.desc ? ":desc" : ":asc"}`).join(",") || "none"} filters=${s.columnFilters.length} selected=${t.getSelectedRowModel().rows.length}`;
};

export const dataTableTools = defineToolCollection<DataTableCtx>({
  namespace: "data-table",
  instructions: "Drives a data-table view. Read state first; filter/sort/page change the view only, not the data; selection.clear deselects rows.",
  describe: state,
  tools: [
    {
      name: "state",
      description: "Read the table state (row count, page, sorting, filters, selection).",
      parameters: noArgs,
      run: (t) => state(t),
    },
    {
      name: "filter.set",
      description: "Set a column filter value (empty string clears it).",
      parameters: obj({ "column!": str("column id"), "value!": str("filter value") }),
      run: (t, a) => {
        t.getColumn(a.column as string)?.setFilterValue((a.value as string) || undefined);
        return state(t);
      },
    },
    {
      name: "sort.set",
      description: "Sort by a column.",
      parameters: obj({ "column!": str("column id"), desc: bool("descending (default false)") }),
      run: (t, a) => {
        t.setSorting([{ id: a.column as string, desc: Boolean(a.desc) }]);
        return state(t);
      },
    },
    {
      name: "page.set",
      description: "Go to a page (1-based).",
      parameters: obj({ "page!": num("page number", { min: 1 }) }),
      run: (t, a) => {
        t.setPageIndex((a.page as number) - 1);
        return state(t);
      },
    },
    {
      name: "selection.clear",
      description: "Clear the row selection.",
      parameters: noArgs,
      run: (t) => {
        t.resetRowSelection();
        return state(t);
      },
    },
  ],
});
