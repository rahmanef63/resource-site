/**
 * Documents feature schema — generic workspace-scoped document store, a
 * lightweight stand-in for richer doc systems (Notion-style pages, MDX
 * trees, etc.). Studio's data-binding queries `documents` to surface them
 * to dynamic widgets.
 *
 * Apps that already have a richer doc layer (e.g. the notion slice) can
 * either drop this table or treat it as a separate corpus.
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

const documents = defineTable({
  workspaceId: v.id("workspaces"),
  title: v.optional(v.string()),
  body: v.optional(v.any()),
  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
})
  .index("by_workspace", ["workspaceId"]);

export const documentsTables = {
  documents,
};
