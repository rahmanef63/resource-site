// Schema fragment for the services slice.
//
// Compose into the consumer's root convex/schema.ts:
//
//   import { servicesTables } from "./features/services/schema";
//   export default defineSchema({ ...servicesTables, ...others });

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const servicesTables = {
  services: defineTable({
    title: v.string(),
    summary: v.string(),
    deliverables: v.array(v.string()),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_order", ["order"]),
};
