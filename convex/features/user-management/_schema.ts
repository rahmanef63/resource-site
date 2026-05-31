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

  um_invites: defineTable({
    tenantId: v.union(v.string(), v.null()),
    inviterId: v.string(),
    email: v.string(),
    roleSlug: v.string(),
    status: v.union(
      v.literal("pending"), v.literal("accepted"), v.literal("declined"), v.literal("expired"),
    ),
    message: v.optional(v.string()),
    token: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_tenant_status", ["tenantId", "status"])
    .index("by_email", ["email"])
    .index("by_token", ["token"]),
};

export default userManagementTables;
