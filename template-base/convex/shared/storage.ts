import { mutation } from "../_generated/server";
import { ensureUser } from "../auth/helpers";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});
