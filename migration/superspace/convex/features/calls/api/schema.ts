import { defineTable } from "convex/server";
import { v } from "convex/values";

export const calls = defineTable({
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
    v.literal("failed")
  ),
  startedAt: v.number(),
  answeredAt: v.optional(v.number()),
  endedAt: v.optional(v.number()),
  duration: v.optional(v.number()),
  metadata: v.optional(
    v.object({
      quality: v.optional(v.string()),
      endReason: v.optional(v.string()),
      recordingUrl: v.optional(v.string()),
    })
  ),
})
  .index("by_conversation", ["conversationId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_initiator", ["initiatorId"])
  .index("by_status", ["status"])
  .index("by_started_at", ["startedAt"]);

export const callParticipants = defineTable({
  callId: v.id("calls"),
  userId: v.id("users"),
  joinedAt: v.optional(v.number()),
  leftAt: v.optional(v.number()),
  isMuted: v.boolean(),
  isVideoOn: v.boolean(),
  status: v.union(
    v.literal("invited"),
    v.literal("joined"),
    v.literal("left"),
    v.literal("declined")
  ),
})
  .index("by_call", ["callId"])
  .index("by_user", ["userId"])
  .index("by_call_user", ["callId", "userId"]);

export const callTables = {
  calls,
  callParticipants,
};
