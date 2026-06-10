// Agentic tool collection. Database rows + view config are parent-owned, so
// the ctx is a small injectable contract the host page builds from its
// state (rows + applyView inputs).

import { defineToolCollection, noArgs, obj, str } from "@/shared/agentic";

export type NotionDatabaseCtx = {
  /** Rendered row lines (id + primary property). */
  rows: () => string;
  addRow: (json: string) => string | Promise<string>;
  updateRow: (rowId: string, json: string) => string | Promise<string>;
  deleteRow: (rowId: string) => string | Promise<string>;
  /** Switch the active view (table/board/list/gallery/calendar/…). */
  setView: (view: string) => string;
  setFilter: (json: string) => string;
  setSort: (field: string, dir: "asc" | "desc") => string;
};

export const notionDatabaseTools = defineToolCollection<NotionDatabaseCtx>({
  namespace: "notion-database",
  tools: [
    {
      name: "rows",
      description: "List the database rows under the current view.",
      parameters: noArgs,
      run: (ctx) => ctx.rows(),
    },
    {
      name: "row.add",
      description: "Add a row (JSON object of property values).",
      parameters: obj({ "json!": str("row properties as JSON") }),
      run: (ctx, a) => ctx.addRow(a.json as string),
    },
    {
      name: "row.update",
      description: "Update a row's properties (JSON patch).",
      parameters: obj({ "rowId!": str("row id"), "json!": str("property patch as JSON") }),
      run: (ctx, a) => ctx.updateRow(a.rowId as string, a.json as string),
    },
    {
      name: "row.delete",
      dangerous: true,
      description: "Delete a row.",
      parameters: obj({ "rowId!": str("row id") }),
      run: (ctx, a) => ctx.deleteRow(a.rowId as string),
    },
    {
      name: "view.switch",
      description: "Switch the active view kind (table, board, list, gallery, calendar, …).",
      parameters: obj({ "view!": str("view kind") }),
      run: (ctx, a) => ctx.setView(a.view as string),
    },
    {
      name: "filter",
      description: "Set the view filter (JSON DatabaseFilter).",
      parameters: obj({ "json!": str("filter as JSON") }),
      run: (ctx, a) => ctx.setFilter(a.json as string),
    },
    {
      name: "sort",
      description: "Sort the view by a property.",
      parameters: obj({ "field!": str("property id"), "dir!": str("direction", { enum: ["asc", "desc"] }) }),
      run: (ctx, a) => ctx.setSort(a.field as string, a.dir as "asc" | "desc"),
    },
  ],
});
