import { query } from "../../_generated";
import { v } from "convex/values";
import { ROLE_PERMISSIONS } from "../schema";

export const hasPermission = query({
  args: {
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("staff"),
      v.literal("client"),
      v.literal("guest")
    ),
    permission: v.string(),
  },
  handler: async (ctx, args) => {
    const permissions = ROLE_PERMISSIONS[args.role];
    return (permissions as readonly string[]).includes(args.permission);
  },
});
