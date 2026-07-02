import { defineTable } from "convex/server";
import { v } from "convex/values";

export const canvasElements = defineTable({
  workspaceId: v.id("workspaces"),
  type: v.union(
    v.literal("text"),
    v.literal("image"),
    v.literal("shape"),
    v.literal("line"),
    v.literal("sticky-note"),
  ),
  position: v.object({
    x: v.number(),
    y: v.number(),
  }),
  size: v.object({
    width: v.number(),
    height: v.number(),
  }),
  properties: v.object({
    content: v.optional(v.string()),
    color: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    fontSize: v.optional(v.number()),
    fontFamily: v.optional(v.string()),
    strokeWidth: v.optional(v.number()),
    opacity: v.optional(v.number()),
  }),
  zIndex: v.number(),
  createdBy: v.id("users"),
  lastModifiedBy: v.id("users"),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_creator", ["createdBy"]);

export const canvasPages = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  version: v.number(),
  createdBy: v.id("users"),
}).index("by_workspace", ["workspaceId"]);

export const canvasTables = {
  canvasElements,
  canvasPages,
};
