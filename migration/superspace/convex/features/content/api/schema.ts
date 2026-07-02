import { defineTable } from "convex/server";
import { v } from "convex/values";

export const reports = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_workspace", ["workspaceId"]);

export const calendar = defineTable({
  workspaceId: v.id("workspaces"),
  title: v.string(),
  description: v.optional(v.string()),
  location: v.optional(v.string()),
  startsAt: v.number(),
  endsAt: v.optional(v.number()),
  allDay: v.optional(v.boolean()),
  type: v.optional(v.string()),
  color: v.optional(v.string()),
  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_start", ["workspaceId", "startsAt"]);

export const tasks = defineTable({
  workspaceId: v.id("workspaces"),
  title: v.string(),
  description: v.optional(v.string()),
  status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("completed")),
  priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  dueDate: v.optional(v.number()),
  assigneeId: v.optional(v.id("users")),
  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_status", ["workspaceId", "status"])
  .index("by_workspace_due", ["workspaceId", "dueDate"]);

export const wiki = defineTable({
  workspaceId: v.id("workspaces"),
  title: v.string(),
  slug: v.optional(v.string()),
  content: v.string(),
  summary: v.optional(v.string()),
  category: v.optional(v.string()),
  isPublished: v.optional(v.boolean()),
  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_category", ["workspaceId", "category"])
  .index("by_workspace_slug", ["workspaceId", "slug"]);

// ============================================================================
// Content Library Tables (centralized asset management)
// ============================================================================

// Content type enum values
export const contentTypes = v.union(
  v.literal("image"),
  v.literal("video"),
  v.literal("audio"),
  v.literal("document"),
  v.literal("link")
);

// Content status enum values
export const contentStatus = v.union(
  v.literal("draft"),
  v.literal("processing"),
  v.literal("ready"),
  v.literal("failed"),
  v.literal("archived")
);

// AI Generation source
export const aiGenerationSource = v.union(
  v.literal("nano-banana"),
  v.literal("veo"),
  v.literal("eleven-labs"),
  v.literal("openai-dalle"),
  v.literal("midjourney"),
  v.literal("stable-diffusion"),
  v.literal("other")
);

// Main content library table
export const content = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  type: contentTypes,
  status: contentStatus,
  
  // Storage info
  storageId: v.optional(v.id("_storage")),
  url: v.optional(v.string()),
  thumbnailStorageId: v.optional(v.id("_storage")),
  
  // File metadata
  mimeType: v.optional(v.string()),
  fileSize: v.optional(v.number()),
  dimensions: v.optional(v.object({
    width: v.number(),
    height: v.number(),
  })),
  duration: v.optional(v.number()),
  
  // AI Generation metadata
  aiGenerated: v.optional(v.boolean()),
  aiSource: v.optional(aiGenerationSource),
  aiPrompt: v.optional(v.string()),
  aiSettings: v.optional(v.any()),
  
  // Organization
  tags: v.optional(v.array(v.string())),
  folder: v.optional(v.string()),
  isFavorite: v.optional(v.boolean()),
  
  // Metadata
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
  usageCount: v.optional(v.number()),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_type", ["workspaceId", "type"])
  .index("by_workspace_status", ["workspaceId", "status"])
  .index("by_workspace_folder", ["workspaceId", "folder"])
  .index("by_created", ["workspaceId", "createdAt"])
  .searchIndex("search_content", {
    searchField: "name",
    filterFields: ["workspaceId", "type", "status"],
  });

// Virtual folder registry for Content Library.
export const contentFolders = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_name", ["workspaceId", "name"]);

// Content usage tracking
export const contentUsage = defineTable({
  contentId: v.id("content"),
  workspaceId: v.id("workspaces"),
  featureId: v.string(),
  entityId: v.string(),
  entityType: v.string(),
  usedAt: v.number(),
})
  .index("by_content", ["contentId"])
  .index("by_feature", ["workspaceId", "featureId"])
  .index("by_entity", ["workspaceId", "featureId", "entityType", "entityId"]);

// AI Generation jobs tracking
export const contentAiJobs = defineTable({
  workspaceId: v.id("workspaces"),
  contentId: v.optional(v.id("content")),
  source: aiGenerationSource,
  prompt: v.string(),
  settings: v.optional(v.any()),
  status: v.union(
    v.literal("pending"),
    v.literal("processing"),
    v.literal("completed"),
    v.literal("failed")
  ),
  result: v.optional(v.any()),
  error: v.optional(v.string()),
  createdBy: v.id("users"),
  createdAt: v.number(),
  completedAt: v.optional(v.number()),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_status", ["workspaceId", "status"])
  .index("by_user", ["workspaceId", "createdBy"]);

export const contentTables = {
  reports,
  calendar,
  tasks,
  wiki,
  content,
  contentFolders,
  contentUsage,
  contentAiJobs,
};
