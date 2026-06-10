/**
 * data-table slice contract.
 *
 * Generic data table on TanStack Table v8 + shadcn primitives. Pure UI — no
 * Convex tables, no env, no peers.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "data-table",
  version: "0.2.0",
  category: "data",
  kind: "ui",
  provides: {
    tools: ["data-table.state", "data-table.filter.set", "data-table.sort.set", "data-table.page.set", "data-table.selection.clear"],
    components: [
      "DataTable",
      "DataTableToolbar",
      "DataTablePagination",
      "DataTableColumnHeader",
    ],
    utils: ["selectionColumn"],
    hooks: [],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [
      { npm: "@tanstack/react-table", range: "^8.21.0" },
      { npm: "lucide-react", range: "^0.400.0" },
    ],
    shadcn: ["table", "button", "input", "checkbox", "dropdown-menu"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
