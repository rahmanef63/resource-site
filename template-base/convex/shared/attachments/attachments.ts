import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";
import { getUserByExternalId } from "../auth";

async function requireUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await getUserByExternalId(ctx, identity.subject);
  if (!user) throw new Error("User not found");
  return user;
}

export const attachFile = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    fileId: v.id("_storage"),
    entityType: v.string(),
    entityId: v.id("_table"),
    name: v.string(),
    originalName: v.string(),
    description: v.optional(v.string()),
    mimeType: v.string(),
    size: v.number(),
    extension: v.string(),
    category: v.union(
      v.literal("image"),
      v.literal("document"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("archive"),
      v.literal("spreadsheet"),
      v.literal("presentation"),
      v.literal("pdf"),
      v.literal("other"),
    ),
    thumbnailId: v.optional(v.id("_storage")),
    previewId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.record(v.string(), v.any())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const attachmentId = await ctx.db.insert("attachments", {
      workspaceId: args.workspaceId,
      fileId: args.fileId,
      entityType: args.entityType,
      entityId: args.entityId,
      name: args.name,
      originalName: args.originalName,
      description: args.description,
      mimeType: args.mimeType,
      size: args.size,
      extension: args.extension,
      category: args.category,
      width: undefined,
      height: undefined,
      duration: undefined,
      thumbnailId: args.thumbnailId,
      previewId: args.previewId,
      isPublic: args.isPublic ?? false,
      accessList: [],
      tags: args.tags ?? [],
      metadata: args.metadata,
      version: 1,
      parentVersionId: undefined,
      isArchived: false,
      isDeleted: false,
      downloadCount: 0,
      viewCount: 0,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    return { success: true, attachmentId };
  },
});

export const listAttachments = query({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
    entityId: v.id("_table"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const items = await ctx.db
      .query("attachments")
      .filter((q) => q.eq(q.field("entityType"), args.entityType))
      .filter((q) => q.eq(q.field("entityId"), args.entityId))
      .collect();

    return items.filter((a) => a.workspaceId === args.workspaceId && !a.isDeleted);
  },
});
