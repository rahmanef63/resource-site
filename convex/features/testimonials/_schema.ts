// Schema fragment for the testimonials slice.
//
// Compose into the consumer's root convex/_schema.ts:
//
//   import { testimonialsTables } from "./features/testimonials/_schema";
//   export default defineSchema({ ...testimonialsTables, ...others });

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const testimonialsTables = {
  testimonials: defineTable({
    quote: v.string(),
    name: v.string(),
    role: v.string(),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_order", ["order"]),
};
