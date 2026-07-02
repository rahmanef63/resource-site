import { defineTable } from "convex/server";
import { v } from "convex/values";

export default {
  files: defineTable({
    workspaceId: v.string(),
    name: v.string(),
    size: v.number(),
    type: v.string(),
    storageId: v.string(), // ID in storage provider
    url: v.string(),
    uploadedBy: v.string(),
    path: v.string(),
    metadata: v.optional(v.record(v.string(), v.any())),
    status: v.union(
      v.literal("uploading"),
      v.literal("ready"),
      v.literal("failed"),
      v.literal("deleted")
    ),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_path", ["workspaceId", "path"])
    .index("by_uploader", ["uploadedBy"]),

  storageTokens: defineTable({
    workspaceId: v.string(),
    fileId: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    type: v.union(v.literal("upload"), v.literal("download")),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_token", ["token"])
    .index("by_file", ["fileId"]),
} as const;
