import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getExistingUserId, requirePermission } from "../../auth/helpers";
import { PERMS } from "../../workspace/permissions"
import type { Id } from "../../_generated/dataModel";
import { logAuditEvent } from "../../shared/audit";


/**
 * Create a new call record
 */
export const createCall = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    conversationId: v.id("conversations"),
    type: v.union(v.literal("audio"), v.literal("video")),
    participantIds: v.array(v.id("users")),
  },
  returns: v.id("calls"),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.CALLS_MANAGE);
    const userId = await getExistingUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();

    // Create the call
    const callId = await ctx.db.insert("calls", {
      workspaceId: args.workspaceId,
      conversationId: args.conversationId,
      initiatorId: userId,
      type: args.type,
      status: "ringing",
      startedAt: now,
    });

    // Add participants
    for (const participantId of args.participantIds) {
      await ctx.db.insert("callParticipants", {
        callId,
        userId: participantId,
        isMuted: false,
        isVideoOn: args.type === "video",
        status: "invited",
      });
    }

    // Add initiator as participant
    await ctx.db.insert("callParticipants", {
      callId,
      userId,
      joinedAt: now,
      isMuted: false,
      isVideoOn: args.type === "video",
      status: "joined",
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "call.create",
      resourceType: "call",
      resourceId: callId,
      metadata: { type: args.type, participantCount: args.participantIds.length },
    });

    return callId;
  },
});

/**
 * Update call status (answer, end, decline, etc.)
 */
export const updateCallStatus = mutation({
  args: {
    callId: v.id("calls"),
    status: v.union(
      v.literal("ringing"),
      v.literal("ongoing"),
      v.literal("ended"),
      v.literal("missed"),
      v.literal("declined"),
      v.literal("failed")
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.callId);
    if (!call) throw new Error("Call not found");
    await requirePermission(ctx, call.workspaceId, PERMS.CALLS_MANAGE);
    const userId = await getExistingUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const updates: Record<string, unknown> = { status: args.status };

    if (args.status === "ongoing" && !call.answeredAt) {
      updates.answeredAt = now;
    }

    if (["ended", "missed", "declined", "failed"].includes(args.status)) {
      updates.endedAt = now;
      if (call.answeredAt) {
        updates.duration = Math.floor((now - call.answeredAt) / 1000);
      }
    }

    await ctx.db.patch(args.callId, updates);

    await logAuditEvent(ctx, {
      workspaceId: call.workspaceId,
      actorUserId: userId,
      action: "call.update_status",
      resourceType: "call",
      resourceId: args.callId,
      changes: { status: args.status },
    });

    return null;
  },
});

/**
 * Seed sample call data for development/testing
 * Creates placeholder calls that can be connected to builder later
 */
export const seedSampleCalls = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    conversationId: v.id("conversations"),
  },
  returns: v.array(v.id("calls")),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.CALLS_MANAGE);
    const userId = await getExistingUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const callIds: Id<"calls">[] = [];

    // Sample call data - placeholders for development
    const sampleCalls = [
      {
        type: "audio" as const,
        status: "ended" as const,
        startedAt: now - 3600000, // 1 hour ago
        answeredAt: now - 3600000 + 5000,
        endedAt: now - 3600000 + 305000,
        duration: 300, // 5 minutes
      },
      {
        type: "video" as const,
        status: "ended" as const,
        startedAt: now - 7200000, // 2 hours ago
        answeredAt: now - 7200000 + 3000,
        endedAt: now - 7200000 + 903000,
        duration: 900, // 15 minutes
      },
      {
        type: "audio" as const,
        status: "missed" as const,
        startedAt: now - 10800000, // 3 hours ago
        endedAt: now - 10800000 + 30000,
      },
    ];

    for (const sample of sampleCalls) {
      const callId = await ctx.db.insert("calls", {
        workspaceId: args.workspaceId,
        conversationId: args.conversationId,
        initiatorId: userId,
        type: sample.type,
        status: sample.status,
        startedAt: sample.startedAt,
        answeredAt: sample.answeredAt,
        endedAt: sample.endedAt,
        duration: sample.duration,
        metadata: {
          quality: "good",
        },
      });

      // Add initiator as participant
      await ctx.db.insert("callParticipants", {
        callId,
        userId,
        joinedAt: sample.answeredAt ?? sample.startedAt,
        leftAt: sample.endedAt,
        isMuted: false,
        isVideoOn: sample.type === "video",
        status: sample.status === "missed" ? "left" : "left",
      });

      callIds.push(callId);
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "call.seed",
      resourceType: "call",
      metadata: { count: callIds.length },
    });

    return callIds;
  },
});
