import { query } from "../../_generated";
import { v } from "convex/values";
import { requirePermission } from "../../../../shared/auth";
import { PERMS } from "../../../../shared/schema";
import { Id } from "../../_generated";

// List files in a workspace
export const listFiles = query({
  args: {
    workspaceId: v.string(),
    path: v.optional(v.string()),
    includeDeleted: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    await requirePermission(ctx, args.workspaceId, PERMS.VIEW_FILES);

    let q = ctx.db
      .query("files")
      .withIndex("by_workspace", (q) =>
        q.eq("workspaceId", args.workspaceId)
      );

    if (args.path) {
      q = q.filter((q) => q.eq(q.field("path"), args.path));
    }

    if (!args.includeDeleted) {
      q = q.filter((q) => q.neq(q.field("status"), "deleted"));
    }

    return await q.take(1000);
  },
});

// Get a single file by ID
export const getFile = query({
  args: {
    workspaceId: v.string(),
    fileId: v.string(),
  },
  async handler(ctx, args) {
    await requirePermission(ctx, args.workspaceId, PERMS.VIEW_FILES);

    const file = await ctx.db.get(args.fileId as Id<"files">);
    if (!file || file.workspaceId !== args.workspaceId) {
      return null;
    }

    return file;
  },
});

// Check if a storage token is valid
export const validateToken = query({
  args: {
    token: v.string(),
  },
  async handler(ctx, args) {
    const storageToken = await ctx.db
      .query("storageTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!storageToken) {
      return { valid: false };
    }

    // Check if token has expired
    if (storageToken.expiresAt < Date.now()) {
      return { valid: false };
    }

    const file = await ctx.db.get(storageToken.fileId as Id<"files">);
    if (!file) {
      return { valid: false };
    }

    return {
      valid: true,
      type: storageToken.type,
      file,
    };
  },
});

