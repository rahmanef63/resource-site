// Schema fragment for the rbac-roles slice. Compose into the consumer's
// root schema:
//
//   import { rbacRolesTables } from "./features/rbac_roles/_schema";
//   export default defineSchema({ ...rbacRolesTables, ...others });
//
// `tenantId` is a generic string (your workspace/org/team id) or null for
// a single-tenant app. Seed the 6 system presets with `seedSystemRoles`.

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const rbacRolesTables = {
  rbac_roles: defineTable({
    tenantId: v.union(v.string(), v.null()),
    name: v.string(),
    slug: v.string(),
    permissions: v.array(v.string()), // e.g. ["members.*", "content.view", "*"]
    color: v.optional(v.string()),
    level: v.number(), // 0 = highest authority
    isSystem: v.boolean(), // preset roles cannot be edited/removed
    isDefault: v.boolean(), // assigned to new members when none specified
    description: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_tenant_slug", ["tenantId", "slug"]),
};

export default rbacRolesTables;
