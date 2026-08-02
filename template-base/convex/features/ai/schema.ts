import { defineTable } from "convex/server";
import { v } from "convex/values";

export const aiSettings = defineTable({
  workspaceId: v.string(),
  provider: v.string(), // openai, anthropic, etc.
  apiKey: v.string(),
  model: v.string(), // gpt-4, gpt-3.5-turbo, claude-2, etc.
  temperature: v.number(),
  maxTokens: v.number(),
  systemPrompt: v.optional(v.string()),
  requiresApproval: v.optional(v.boolean()), // Global approval mode
  rateLimit: v.optional(v.number()),
  status: v.string(), // active, disabled
  updatedAt: v.number(),
  updatedBy: v.optional(v.string()),
})
  .index("by_workspace", ["workspaceId"]);

export const knowledgeBaseDocuments = defineTable({
  workspaceId: v.string(),
  sourceType: v.string(), // posts, portfolio, services, products, etc.
  sourceId: v.string(),
  title: v.string(),
  content: v.string(),
  url: v.optional(v.string()),
  locale: v.string(),
  metadata: v.optional(v.object({
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  })),
  embedding: v.optional(v.array(v.float64())),
  status: v.string(), // active, archived
  createdAt: v.number(),
  createdBy: v.optional(v.string()),
  updatedAt: v.number(),
  updatedBy: v.optional(v.string()),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_source", ["workspaceId", "sourceType", "sourceId"])
  .index("by_status", ["workspaceId", "status"])
  .vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536,
    filterFields: ["workspaceId", "status"],
  });

export const aiChatSessions = defineTable({
  workspaceId: v.optional(v.string()), // Optional: null for global/private sessions
  userId: v.string(),
  title: v.string(),
  icon: v.optional(v.string()), // Icon name from lucide-react
  isGlobal: v.optional(v.boolean()), // true for global/private sessions
  metadata: v.optional(v.record(v.string(), v.any())), // Store session-level metadata like agentId
  messages: v.array(v.object({
    id: v.optional(v.string()),
    role: v.string(), // system, user, assistant
    content: v.string(),
    timestamp: v.number(),

    // New fields for advanced features
    branches: v.optional(v.array(v.object({
      id: v.string(),
      content: v.string(),
      timestamp: v.number(),
    }))),

    attachments: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      type: v.string(),
      url: v.string(),
      size: v.number(),
    }))),

    replyTo: v.optional(v.string()),
    feedback: v.optional(v.string()), // "up" | "down"
    reasoning: v.optional(v.string()),

    metadata: v.optional(v.object({
      tokenCount: v.optional(v.float64()),
      contextIds: v.optional(v.array(v.string())),
      duration: v.optional(v.float64()),
    })),
  })),
  status: v.string(), // active, archived
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_workspace_user", ["workspaceId", "userId"])
  .index("by_user", ["userId"]) // For global sessions (no workspaceId)
  .index("by_status", ["workspaceId", "status"])
  .index("by_global", ["isGlobal", "userId"]); // For querying global sessions

export const aiUsageStats = defineTable({
  workspaceId: v.string(),
  date: v.string(), // YYYY-MM-DD
  provider: v.string(),
  model: v.string(),
  requestCount: v.number(),
  tokenCount: v.number(),
  cost: v.number(),
  errors: v.number(),
})
  .index("by_workspace_date", ["workspaceId", "date"])
  .index("by_provider", ["workspaceId", "provider", "date"]);

export const aiActionApprovals = defineTable({
  workspaceId: v.string(),
  userId: v.string(),
  agentId: v.string(),
  toolName: v.string(),
  args: v.string(), // JSON stringified args
  status: v.string(), // pending, approved, rejected
  reason: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  reviewedBy: v.optional(v.string()),
  reviewedAt: v.optional(v.number()),
})
  .index("by_workspace_status", ["workspaceId", "status"]);

export const aiTrainingExamples = defineTable({
  workspaceId: v.string(),
  input: v.string(),
  output: v.string(),
  category: v.optional(v.string()),
  status: v.string(), // active, archived
  createdAt: v.number(),
  createdBy: v.string(),
})
  .index("by_workspace", ["workspaceId"]);

export const aiPromptVersions = defineTable({
  workspaceId: v.string(),
  prompt: v.string(),
  version: v.number(),
  label: v.optional(v.string()), // e.g., "v1.0", "prod-candidate"
  isActive: v.boolean(),
  createdAt: v.number(),
  createdBy: v.string(),
})
  .index("by_workspace_active", ["workspaceId", "isActive"]);

export const aiTables = {
  aiSettings,
  knowledgeBaseDocuments,
  aiChatSessions,
  aiUsageStats,
  aiActionApprovals,
  aiTrainingExamples,
  aiPromptVersions,
};
