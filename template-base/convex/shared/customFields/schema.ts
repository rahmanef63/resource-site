/**
 * Shared Custom Fields Schema
 * Provides dynamic custom field functionality across all ERP modules
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Custom field definitions
  customFieldDefinitions: defineTable({
    workspaceId: v.id("workspaces"),
    entity: v.string(), // Table name where fields apply
    fieldId: v.string(), // Unique identifier for the field
    name: v.string(),
    label: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("text"),
      v.literal("textarea"),
      v.literal("number"),
      v.literal("currency"),
      v.literal("date"),
      v.literal("datetime"),
      v.literal("boolean"),
      v.literal("select"),
      v.literal("multiselect"),
      v.literal("email"),
      v.literal("phone"),
      v.literal("url"),
      v.literal("file")
    ),
    required: v.boolean(),
    unique: v.boolean(),
    defaultValue: v.optional(v.any()),
    options: v.optional(v.array(v.string())), // For select/multiselect
    validation: v.optional(v.object({
      min: v.optional(v.number()),
      max: v.optional(v.number()),
      pattern: v.optional(v.string()),
      custom: v.optional(v.string()),
    })),
    permissions: v.optional(v.array(v.string())),
    order: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace_entity", ["workspaceId", "entity", "isActive", "order"])
    .index("by_entity", ["entity", "isActive"])
    .index("by_fieldId", ["fieldId"]),

  // Custom field values (stored as separate table for efficiency)
  customFieldValues: defineTable({
    workspaceId: v.id("workspaces"),
    entity: v.string(),
    entityId: v.id("users"), // Generic ID - will be typed per entity
    fieldId: v.string(),
    value: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_entity", ["entity", "entityId", "fieldId"])
    .index("by_field", ["fieldId", "entityId"])
    .index("by_workspace", ["workspaceId", "entity", "entityId"]),

  // Custom field groups for organization
  customFieldGroups: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    entity: v.string(),
    fields: v.array(v.string()), // Array of fieldIds
    order: v.number(),
    isActive: v.boolean(),
    isCollapsible: v.boolean(),
    defaultExpanded: v.boolean(),
    permissions: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace_entity", ["workspaceId", "entity", "isActive", "order"])
    .index("by_entity", ["entity", "isActive"]),
});