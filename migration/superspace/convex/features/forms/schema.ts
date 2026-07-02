/**
 * Forms Feature Schema
 * Provides form builder and data collection functionality
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

const formFieldSchema = v.object({
  id: v.string(),
  type: v.union(
    v.literal("text"),
    v.literal("textarea"),
    v.literal("number"),
    v.literal("email"),
    v.literal("phone"),
    v.literal("date"),
    v.literal("datetime"),
    v.literal("time"),
    v.literal("select"),
    v.literal("multiselect"),
    v.literal("checkbox"),
    v.literal("radio"),
    v.literal("file"),
    v.literal("rating"),
    v.literal("signature"),
    v.literal("divider")
  ),
  label: v.string(),
  placeholder: v.optional(v.string()),
  helpText: v.optional(v.string()),
  required: v.boolean(),
  validation: v.optional(v.object({
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    minLength: v.optional(v.number()),
    maxLength: v.optional(v.number()),
    pattern: v.optional(v.string()),
    customMessage: v.optional(v.string()),
  })),
  options: v.optional(v.array(v.object({
    label: v.string(),
    value: v.string(),
  }))),
  defaultValue: v.optional(v.any()),
  conditionalLogic: v.optional(v.object({
    show: v.boolean(),
    conditions: v.array(v.object({
      fieldId: v.string(),
      operator: v.string(),
      value: v.any(),
    })),
  })),
  order: v.number(),
});

export const formsTables = {
  // Form definitions
  forms: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    fields: v.array(formFieldSchema),
    settings: v.object({
      allowMultipleSubmissions: v.boolean(),
      requireAuth: v.boolean(),
      successMessage: v.optional(v.string()),
      redirectUrl: v.optional(v.string()),
      notifyEmails: v.optional(v.array(v.string())),
      closedMessage: v.optional(v.string()),
      submitButtonText: v.optional(v.string()),
    }),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("closed"),
      v.literal("archived")
    ),
    publishedAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
    submissionCount: v.number(),
    viewCount: v.number(),
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["status"])
    .index("by_creator", ["createdBy"]),

  // Form submissions
  formSubmissions: defineTable({
    formId: v.id("forms"),
    data: v.record(v.string(), v.any()),
    metadata: v.optional(v.object({
      ip: v.optional(v.string()),
      userAgent: v.optional(v.string()),
      referrer: v.optional(v.string()),
      completionTime: v.optional(v.number()),
    })),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    notes: v.optional(v.string()),
    workspaceId: v.id("workspaces"),
    submittedBy: v.optional(v.id("users")),
    submittedAt: v.number(),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_form", ["formId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["status"])
    .index("by_submitted", ["submittedAt"]),
};

export default formsTables;
