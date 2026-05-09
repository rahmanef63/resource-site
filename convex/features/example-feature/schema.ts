// Schema fragment for the example-feature slice.
//
// Composed into the consumer's root convex/schema.ts via:
//
//   import { exampleFeatureTables } from "./features/example-feature/schema";
//   export default defineSchema({ ...exampleFeatureTables, ...others });
//
// Never declare a table here that another slice also declares — slug-prefix
// the table name if you risk collision (e.g., `exampleItems`, not `items`).

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const exampleFeatureTables = {
  exampleItems: defineTable({
    title: v.string(),
    createdAt: v.number(),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_createdBy", ["createdBy"]),
};
