import { defineTable } from "convex/server"
import { v } from "convex/values"

/**
 * cms-lite AI admin tables.
 *
 * Scope: per-workspace settings (singleton row) + knowledge-base
 * documents (N rows). Stats/errors/activity tables are deferred — they
 * require a chat-runtime logger to produce meaningful data.
 */

export const cmsLiteAiSettingsTable = defineTable({
  workspaceId: v.id("workspaces"),
  enabled: v.boolean(),
  defaultLocale: v.string(), // "id" | "en" | "ar" | ...
  rateLimitPerMinute: v.number(),
  rateLimitPerHour: v.number(),
  systemPromptId: v.optional(v.string()),
  systemPromptEn: v.optional(v.string()),
  systemPromptAr: v.optional(v.string()),
  personality: v.string(), // "professional" | "casual" | "custom" | ...
  customPersonality: v.optional(v.string()),
  updatedBy: v.optional(v.id("users")),
  updatedAt: v.number(),
}).index("by_workspace", ["workspaceId"])

export const cmsLiteAiKnowledgeBaseTable = defineTable({
  workspaceId: v.id("workspaces"),
  title: v.string(),
  content: v.string(),
  fileUrl: v.optional(v.string()),
  category: v.string(), // "general" | "services" | "products" | "policies" | "faq"
  active: v.boolean(),
  createdBy: v.id("users"),
  updatedBy: v.optional(v.id("users")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_category", ["workspaceId", "category"])
  .index("by_workspace_active", ["workspaceId", "active"])

/**
 * Per-request activity log. Written by the chat runtime via the
 * `logAiEvent` mutation. Retention should be capped via cron; for now
 * queries apply a 30-day window + .take() ceiling.
 */
export const cmsLiteAiActivityTable = defineTable({
  workspaceId: v.id("workspaces"),
  userId: v.optional(v.id("users")),
  /** External user identifier when auth isn't in play (guest chats). */
  externalUserId: v.optional(v.string()),
  locale: v.string(),
  messageLength: v.number(),
  responseLength: v.number(),
  referencesCount: v.number(),
  rateLimited: v.boolean(),
  /** Truncated first-200-chars snippet — NOT a full transcript (PII). */
  messageSnippet: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_createdAt", ["workspaceId", "createdAt"])
  .index("by_workspace_locale", ["workspaceId", "locale"])

export const cmsLiteAiErrorsTable = defineTable({
  workspaceId: v.id("workspaces"),
  errorType: v.string(), // "rate_limit" | "provider_down" | "validation" | "unknown"
  errorMessage: v.string(),
  userMessage: v.string(),
  locale: v.string(),
  context: v.optional(v.any()),
  createdAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_createdAt", ["workspaceId", "createdAt"])

export default {
  cmsLiteAiSettings: cmsLiteAiSettingsTable,
  cmsLiteAiKnowledgeBase: cmsLiteAiKnowledgeBaseTable,
  cmsLiteAiActivity: cmsLiteAiActivityTable,
  cmsLiteAiErrors: cmsLiteAiErrorsTable,
} as const
