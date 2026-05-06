/**
 * Database feature schema — generic key/value tables that any app can use as
 * a no-code database (similar to Notion's database views or Airtable bases).
 *
 * Studio's data-binding queries `dbTables` / `dbRows` to populate dynamic
 * widgets at runtime. Apps that don't need a no-code database can drop these
 * tables (and the corresponding studio data-binding code paths) without
 * affecting any other slice.
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

const dbTables = defineTable({
  workspaceId: v.id("workspaces"),
  label: v.string(),
  slug: v.optional(v.string()),
  fields: v.optional(v.any()),
  draftsEnabled: v.optional(v.boolean()),
  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
})
  .index("by_workspace", ["workspaceId"]);

const dbRows = defineTable({
  tableId: v.id("dbTables"),
  workspaceId: v.optional(v.id("workspaces")),
  data: v.any(),
})
  .index("by_table", ["tableId"])
  .index("by_workspace", ["workspaceId"]);

export const databaseTables = {
  dbTables,
  dbRows,
};
