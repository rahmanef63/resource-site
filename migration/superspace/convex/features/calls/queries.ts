import { v } from "convex/values";
import { query } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { getExistingUserId, requireActiveMembership } from "../../auth/helpers";

// Document shape of the `calls` table (mirrors api/schema.ts).
// Used to build concrete return validators instead of v.any().
const callFields = {
  _id: v.id("calls"),
  _creationTime: v.number(),
  conversationId: v.id("conversations"),
  workspaceId: v.id("workspaces"),
  initiatorId: v.id("users"),
  type: v.union(v.literal("audio"), v.literal("video")),
  status: v.union(
    v.literal("ringing"),
    v.literal("ongoing"),
    v.literal("ended"),
    v.literal("missed"),
    v.literal("declined"),
    v.literal("failed"),
  ),
  startedAt: v.number(),
  answeredAt: v.optional(v.number()),
  endedAt: v.optional(v.number()),
  duration: v.optional(v.number()),
  metadata: v.optional(v.any()),
};

/**
 * Get all calls for a workspace
 */
export const getWorkspaceCalls = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const calls = await ctx.db
      .query("calls")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(50);

    // Fetch all participants in parallel (one query per call, all parallel)
    const allParticipants = await Promise.all(
      calls.map((call) =>
        ctx.db
          .query("callParticipants")
          .withIndex("by_call", (q) => q.eq("callId", call._id))
          .take(1000)
      )
    );

    // Collect all unique userIds for a single batch fetch
    const allUserIds = new Set<Id<"users">>();
    calls.forEach((c) => allUserIds.add(c.initiatorId));
    allParticipants.flat().forEach((p) => allUserIds.add(p.userId));

    const fetchedUsers = await Promise.all(
      Array.from(allUserIds).map((id) => ctx.db.get(id))
    );
    const userMap = new Map(
      fetchedUsers.filter(Boolean).map((u) => [u!._id, u!])
    );

    return calls.map((call, i) => ({
      ...call,
      initiator: userMap.get(call.initiatorId) ?? null,
      participants: allParticipants[i].map((p) => ({
        ...p,
        user: userMap.get(p.userId) ?? null,
      })),
    }));
  },
});

/**
 * Get a single call with full details
 */
export const getCall = query({
  args: {
    callId: v.id("calls"),
  },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.callId);
    if (!call) return null;

    await requireActiveMembership(ctx, call.workspaceId);

    const initiator = await ctx.db.get(call.initiatorId);
    const participants = await ctx.db
      .query("callParticipants")
      .withIndex("by_call", (q) => q.eq("callId", call._id))
      .take(1000);

    const participantDetails = await Promise.all(
      participants.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return { ...p, user };
      })
    );

    return {
      ...call,
      initiator,
      participants: participantDetails,
    };
  },
});

/**
 * Get call history for current user
 */
export const getMyCallHistory = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      ...callFields,
      initiator: v.any(),
      participants: v.array(v.any()),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    // Get calls where user was initiator
    const initiatedCalls = await ctx.db
      .query("calls")
      .withIndex("by_initiator", (q) => q.eq("initiatorId", userId))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .order("desc")
      .take(args.limit ?? 50);

    // Get calls where user was participant
    const participations = await ctx.db
      .query("callParticipants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(1000);

    const participatedCallIds = participations.map((p) => p.callId);
    const participatedCalls = await Promise.all(
      participatedCallIds.map((id) => ctx.db.get(id))
    );

    const validParticipatedCalls = participatedCalls.filter(
      (call): call is NonNullable<typeof call> =>
        call !== null && call.workspaceId === args.workspaceId
    );

    // Merge and dedupe
    const allCalls = [...initiatedCalls, ...validParticipatedCalls];
    const uniqueCalls = Array.from(
      new Map(allCalls.map((c) => [c._id, c])).values()
    );

    // Sort by start time desc and limit
    const sortedCalls = uniqueCalls
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, args.limit ?? 50);

    // Fetch all participants in parallel, then batch-fetch all users
    const allParticipants = await Promise.all(
      sortedCalls.map((call) =>
        ctx.db
          .query("callParticipants")
          .withIndex("by_call", (q) => q.eq("callId", call._id))
          .take(1000)
      )
    );

    const allUserIds = new Set<Id<"users">>();
    sortedCalls.forEach((c) => allUserIds.add(c.initiatorId));
    allParticipants.flat().forEach((p) => allUserIds.add(p.userId));

    const fetchedUsers = await Promise.all(
      Array.from(allUserIds).map((id) => ctx.db.get(id))
    );
    const userMap = new Map(
      fetchedUsers.filter(Boolean).map((u) => [u!._id, u!])
    );

    return sortedCalls.map((call, i) => ({
      ...call,
      initiator: userMap.get(call.initiatorId) ?? null,
      participants: allParticipants[i].map((p) => ({
        ...p,
        user: userMap.get(p.userId) ?? null,
      })),
    }));
  },
});
