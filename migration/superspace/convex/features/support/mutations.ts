import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit";
import { nextCounterValue, formatCounter } from "../../shared/counters";

export const createTicket = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.string(),
    customerId: v.id("users"),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent"),
      ),
    ),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("supportTickets"),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.SUPPORT_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const ticketNumberValue = await nextCounterValue(
      ctx,
      args.workspaceId,
      "support.ticketNumber",
    )
    const ticketNumber = formatCounter("TICKET", ticketNumberValue, 6)

    const conversationId = await ctx.db.insert("conversations", {
      name: args.title,
      type: "group",
      workspaceId: args.workspaceId,
      createdBy: userId,
      isActive: true,
      metadata: { description: `Support ticket: ${ticketNumber}` },
    });

    await ctx.db.insert("conversationParticipants", {
      conversationId,
      userId: args.customerId,
      role: "member",
      joinedAt: Date.now(),
      isActive: true,
    });

    if (args.customerId !== userId) {
      await ctx.db.insert("conversationParticipants", {
        conversationId,
        userId,
        role: "admin",
        joinedAt: Date.now(),
        isActive: true,
      });
    }

    const ticketId = await ctx.db.insert("supportTickets", {
      workspaceId: args.workspaceId,
      ticketNumber,
      title: args.title,
      description: args.description,
      status: "open",
      priority: args.priority ?? "medium",
      customerId: args.customerId,
      category: args.category,
      tags: args.tags,
      conversationId,
      createdBy: userId,
    });

    await ctx.db.insert("messages", {
      conversationId,
      senderId: args.customerId,
      content: args.description,
      type: "text",
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "support_ticket.create",
      resourceType: "supportTicket",
      resourceId: ticketId,
      metadata: { ticketNumber, priority: args.priority },
    });

    return ticketId;
  },
});

export const updateTicketStatus = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    status: v.union(
      v.literal("open"),
      v.literal("pending"),
      v.literal("resolved"),
      v.literal("closed"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");
    await requirePermission(ctx, ticket.workspaceId, PERMS.SUPPORT_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const updates: any = { status: args.status };
    if (args.status === "resolved" && !ticket.resolvedAt) {
      updates.resolvedAt = Date.now();
    }
    if (args.status === "closed" && !ticket.closedAt) {
      updates.closedAt = Date.now();
    }

    await ctx.db.patch(args.ticketId, updates);

    await logAuditEvent(ctx, {
      workspaceId: ticket.workspaceId,
      actorUserId: userId,
      action: "support_ticket.update_status",
      resourceType: "supportTicket",
      resourceId: args.ticketId,
      changes: { status: { from: ticket.status, to: args.status } },
    });

    return null;
  },
});

export const assignTicket = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    assigneeId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");
    await requirePermission(ctx, ticket.workspaceId, PERMS.SUPPORT_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.ticketId, { assignedTo: args.assigneeId });

    const existingParticipant = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_conversation", (q: any) =>
        q.eq("userId", args.assigneeId).eq("conversationId", ticket.conversationId),
      )
      .first();

    if (!existingParticipant) {
      await ctx.db.insert("conversationParticipants", {
        conversationId: ticket.conversationId,
        userId: args.assigneeId,
        role: "admin",
        joinedAt: Date.now(),
        isActive: true,
      });
    }

    await logAuditEvent(ctx, {
      workspaceId: ticket.workspaceId,
      actorUserId: userId,
      action: "support_ticket.assign",
      resourceType: "supportTicket",
      resourceId: args.ticketId,
      changes: { assignedTo: args.assigneeId },
    });

    return null;
  },
});

export const addInternalNote = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    note: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");
    await requirePermission(ctx, ticket.workspaceId, PERMS.SUPPORT_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const internalNotes = ticket.metadata?.internalNotes || [];
    internalNotes.push({ note: args.note, authorId: userId, createdAt: Date.now() });

    await ctx.db.patch(args.ticketId, {
      metadata: { ...ticket.metadata, internalNotes },
    });

    await logAuditEvent(ctx, {
      workspaceId: ticket.workspaceId,
      actorUserId: userId,
      action: "support_ticket.add_note",
      resourceType: "supportTicket",
      resourceId: args.ticketId,
    });

    return null;
  },
});

export const closeTicket = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    ticketId: v.id("supportTickets"),
    resolutionNote: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.SUPPORT_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.workspaceId !== args.workspaceId) {
      throw new Error("Ticket not found");
    }
    if (ticket.status === "closed") return null;

    await ctx.db.patch(args.ticketId, {
      status: "closed",
      closedAt: Date.now(),
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "support_ticket.closed",
      resourceType: "supportTicket",
      resourceId: args.ticketId,
      metadata: { previousStatus: ticket.status, resolutionNote: args.resolutionNote },
    });

    return null;
  },
});

export const deleteTicket = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    ticketId: v.id("supportTickets"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.SUPPORT_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.workspaceId !== args.workspaceId) {
      throw new Error("Ticket not found");
    }

    await ctx.db.delete(args.ticketId);

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "support_ticket.deleted",
      resourceType: "supportTicket",
      resourceId: args.ticketId,
      metadata: { ticketNumber: ticket.ticketNumber, title: ticket.title },
    });

    return null;
  },
});

export const updateTicket = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    title: v.optional(v.string()),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent"),
      ),
    ),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");
    await requirePermission(ctx, ticket.workspaceId, PERMS.SUPPORT_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const updates: Record<string, any> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.category !== undefined) updates.category = args.category;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.ticketId, updates);

    await logAuditEvent(ctx, {
      workspaceId: ticket.workspaceId,
      actorUserId: userId,
      action: "support_ticket.update",
      resourceType: "supportTicket",
      resourceId: args.ticketId,
      changes: updates,
    });

    return null;
  },
});
