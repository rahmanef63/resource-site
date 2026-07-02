import { action } from "../../_generated";
import { v } from "convex/values";

export const generatePresignedUrls = action({
  args: {
    workspaceId: v.string(),
    fileIds: v.array(v.string()),
    operation: v.union(v.literal("upload"), v.literal("download")),
  },
  handler: async () => {
    throw new Error("Storage integration is not configured in this environment.");
  },
});

