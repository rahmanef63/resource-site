// Schema fragment for the user-management slice. Compose into the root:
//
//   import { userManagementTables } from "./features/user-management/_schema";
//   export default defineSchema({ ...userManagementTables, ...others });
//
// `um_members` maps a user → tenant → role. `roleSlug` references a row in
// rbac-roles' `rbac_roles` table (or a preset slug). Profile fields
// (name/email/avatar) live on the `users` table — `listMembers` joins them.

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const userManagementTables = {
  um_members: defineTable({
    tenantId: v.union(v.string(), v.null()),
    userId: v.string(), // Id<"users"> as a string for portability
    roleSlug: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending")),
    additionalPermissions: v.optional(v.array(v.string())),
    joinedAt: v.number(),
    invitedBy: v.optional(v.string()),
    lastActiveAt: v.optional(v.number()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_tenant_user", ["tenantId", "userId"])
    .index("by_user", ["userId"]),
};

export default userManagementTables;
