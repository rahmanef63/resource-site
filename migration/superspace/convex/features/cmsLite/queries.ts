import { query } from "./_generated";
import { v } from "convex/values";
import { requireMembership } from "./shared/auth";

/**
 * Queries for cms-lite feature
 */
export const getData = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // TODO: REQUIRED: Check workspace membership
    const membership = await requireMembership(ctx, args.workspaceId);

    // TODO: Implement your query logic
    return {
      message: "Query successful",
      userId: membership.userId,
      roleLevel: membership.roleLevel,
    };
  },
});
