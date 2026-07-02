import { action } from "../../_generated";
import { v } from "convex/values";

// Sync user data from Clerk
export const syncClerkUser = action({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  async handler() {
    throw new Error("User sync is not configured for this deployment.");
  },
});

