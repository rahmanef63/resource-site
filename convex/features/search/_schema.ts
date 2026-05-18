import { defineTable } from "convex/server";
import { v } from "convex/values";

export const searchTables = {
  searchDocuments: defineTable({
    sourceTable: v.string(),
    sourceId: v.string(),
    title: v.string(),
    body: v.string(),
    embedding: v.array(v.number()),
    indexedAt: v.number(),
  })
    .index("by_source", ["sourceTable", "sourceId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
    }),
};
