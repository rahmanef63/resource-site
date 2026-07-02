import { mutation } from "../../_generated";
import { v } from "convex/values";
import { requirePermission } from "../../../../shared/auth";
import { PERMS } from "../../../../shared/schema";
import { logAuditEvent } from "../../../../shared/audit";
import { Id } from "../../_generated";

// Create a new file record
export const createFile = mutation({
  args: {
    workspaceId: v.string(),
    name: v.string(),
    size: v.number(),
    type: v.string(),
    storageId: v.string(),
    url: v.string(),
    path: v.string(),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  async handler(ctx, args) {
    const membership = await requirePermission(ctx, args.workspaceId, PERMS.UPLOAD_FILES);

    const file = await ctx.db.insert("files", {
      ...args,
      uploadedBy: membership.userId,
      status: "uploading",
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      action: "storage.file.create",
      actor: membership.userId,
      actorUserId: membership.userDocId,
      target: {
        type: "file",
        id: file,
        workspaceId: args.workspaceId,
      },
    });

    return file;
  },
});

// Update file status
export const updateFileStatus = mutation({
  args: {
    workspaceId: v.string(),
    fileId: v.string(),
    status: v.union(
      v.literal("uploading"),
      v.literal("ready"),
      v.literal("failed"),
      v.literal("deleted")
    ),
  },
  async handler(ctx, args) {
    const membership = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_FILES);

    const file = await ctx.db.get(args.fileId as Id<"files">);
    if (!file || file.workspaceId !== args.workspaceId) {
      throw new Error("File not found");
    }

    await ctx.db.patch(args.fileId as Id<"files">, {
      status: args.status,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      action: "storage.file.update_status",
      actor: membership.userId,
      actorUserId: membership.userDocId,
      target: {
        type: "file",
        id: args.fileId,
        workspaceId: args.workspaceId,
      },
      changes: {
        status: {
          from: file.status,
          to: args.status,
        },
      },
    });
  },
});

// Create a storage token for upload/download
export const createStorageToken = mutation({
  args: {
    workspaceId: v.string(),
    fileId: v.string(),
    type: v.union(v.literal("upload"), v.literal("download")),
    expiresIn: v.optional(v.number()), // milliseconds
  },
  async handler(ctx, args) {
    const membership = await requirePermission(
      ctx,
      args.workspaceId,
      args.type === "upload" ? PERMS.UPLOAD_FILES : PERMS.VIEW_FILES
    );

    const file = await ctx.db.get(args.fileId as Id<"files">);
    if (!file || file.workspaceId !== args.workspaceId) {
      throw new Error("File not found");
    }

    const token = await ctx.db.insert("storageTokens", {
      workspaceId: args.workspaceId,
      fileId: args.fileId,
      token: crypto.randomUUID(),
      type: args.type,
      expiresAt: Date.now() + (args.expiresIn || 3600000), // Default 1 hour
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: membership.userId,
      actorUserId: membership.userDocId,
      action: "storage.token.create",
      resourceType: "storageToken",
      resourceId: token,
      metadata: {
        fileId: args.fileId,
        type: args.type,
      },
    });

    return token;
  },
});

