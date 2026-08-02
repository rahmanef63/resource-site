/**
 * workspace-shell — Convex schema (P0 scaffold).
 *
 * Six new tables with `workspaceShell_` prefix, replacing the legacy
 * `menuSets` / `menuItems` / `menuItemComponents` / `workspaceMenuAssignments`
 * / `userMenuAssignments` / `roleMenuPermissions` tables. The legacy tables
 * stay during the 30-day deprecation window (drop scheduled 2026-06-19).
 *
 * Plus one new table `workspaceShell_navContext` — atomic per-user navigation
 * context cache (workspaceId + menuSetId pair). Resolver: user > workspace > system.
 */
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const workspaceShellTables = {
  // Menu set = named bundle of menu items (workspace default, user personal, system, cms).
  workspaceShell_menuSets: defineTable({
    workspaceId: v.optional(v.id("workspaces")),
    ownerType: v.union(
      v.literal("system"),
      v.literal("workspace"),
      v.literal("user"),
      v.literal("cms"),
    ),
    ownerUserId: v.optional(v.id("users")),
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    forkedFromId: v.optional(v.id("workspaceShell_menuSets")),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerType", ["ownerType"])
    .index("by_ownerWorkspace", ["workspaceId"])
    .index("by_ownerUser", ["ownerUserId"])
    .index("by_slug", ["slug"]),

  // Menu item = single nav entry inside a menuSet. Tree via parentId.
  // menuSetId is optional to match legacy schema (some pre-menuSet items
  // existed as workspace-orphan entries); new items SHOULD always set it.
  workspaceShell_menuItems: defineTable({
    workspaceId: v.optional(v.id("workspaces")),
    menuSetId: v.optional(v.id("workspaceShell_menuSets")),
    parentId: v.optional(v.id("workspaceShell_menuItems")),
    featureSlug: v.optional(v.string()),
    label: v.string(),
    icon: v.optional(v.string()),
    route: v.optional(v.string()),
    order: v.number(),
    isVisible: v.optional(v.boolean()),
    requiredPermission: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_menuSet", ["menuSetId"])
    .index("by_parent", ["parentId"])
    .index("by_workspace_parent", ["workspaceId", "parentId"]),

  // Component slot bound to a menu item (versioned CMS components).
  workspaceShell_itemComponents: defineTable({
    menuItemId: v.id("workspaceShell_menuItems"),
    componentVersionId: v.string(),
    slotKey: v.optional(v.string()),
    config: v.optional(v.record(v.string(), v.any())),
    createdAt: v.number(),
  })
    .index("by_menuItem", ["menuItemId"])
    .index("by_componentVersion", ["componentVersionId"]),

  // Workspace → MenuSet binding (single default + optional alternatives).
  workspaceShell_wsAssignments: defineTable({
    workspaceId: v.id("workspaces"),
    menuSetId: v.id("workspaceShell_menuSets"),
    isDefault: v.optional(v.boolean()),
    label: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_menuSet", ["menuSetId"])
    .index("by_workspace_default", ["workspaceId", "isDefault"]),

  // User → MenuSet override (workspace-scoped or global default).
  workspaceShell_userAssignments: defineTable({
    userId: v.id("users"),
    workspaceId: v.optional(v.id("workspaces")),
    menuSetId: v.id("workspaceShell_menuSets"),
    scope: v.union(v.literal("workspace"), v.literal("global")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_menuSet", ["menuSetId"])
    .index("by_user_workspace", ["userId", "workspaceId"]),

  // RBAC: role → which menu items they can see.
  workspaceShell_rolePerms: defineTable({
    roleId: v.id("roles"),
    menuItemId: v.id("workspaceShell_menuItems"),
    canView: v.boolean(),
    canEdit: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_role", ["roleId"])
    .index("by_menu", ["menuItemId"])
    .index("by_role_menu", ["roleId", "menuItemId"]),

  // Atomic per-user nav context (workspaceId + menuSetId). Cached + audited.
  workspaceShell_navContext: defineTable({
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    menuSetId: v.optional(v.id("workspaceShell_menuSets")),
    source: v.union(
      v.literal("user"),
      v.literal("workspace"),
      v.literal("system"),
    ),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_workspace", ["userId", "workspaceId"]),
};
