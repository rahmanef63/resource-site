import { defineTable } from "convex/server";
import { v } from "convex/values";

export const menuItems = defineTable({
  workspaceId: v.id("workspaces"),
  menuSetId: v.optional(v.id("menuSets")),
  parentId: v.optional(v.id("menuItems")),
  name: v.string(),
  slug: v.string(),
  type: v.union(
    v.literal("folder"),
    v.literal("group"),
    v.literal("route"),
    v.literal("divider"),
    v.literal("action"),
    v.literal("chat"),
    v.literal("document"),
  ),
  icon: v.optional(v.string()),
  path: v.optional(v.string()),
  component: v.optional(v.string()),
  order: v.number(),
  isVisible: v.boolean(),
  visibleForRoleIds: v.array(v.id("roles")),
  metadata: v.optional(
    v.object({
      badge: v.optional(v.string()),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
      targetId: v.optional(v.string()),
      jsonPlaceholder: v.optional(v.object({})),
      version: v.optional(v.string()),
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      lastUpdated: v.optional(v.number()),
      previousVersion: v.optional(v.string()),
      status: v.optional(
        v.union(
          v.literal("stable"),
          v.literal("beta"),
          v.literal("development"),
          v.literal("experimental"),
          v.literal("deprecated"),
        ),
      ),
      isReady: v.optional(v.boolean()),
      expectedRelease: v.optional(v.string()),
      featureType: v.optional(
        v.union(
          v.literal("default"),
          v.literal("system"),
          v.literal("optional"),
        ),
      ),
      originalFeatureType: v.optional(
        v.union(
          v.literal("default"),
          v.literal("system"),
          v.literal("optional"),
        ),
      ),
      requiresPermission: v.optional(v.string()),
      originalRequiresPermission: v.optional(v.string()),
    }),
  ),
  createdBy: v.id("users"),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_menuSet", ["menuSetId"])
  .index("by_workspace_parent", ["workspaceId", "parentId"])
  .index("by_parent", ["parentId"]);

export const roleMenuPermissions = defineTable({
  roleId: v.id("roles"),
  menuItemId: v.id("menuItems"),
  canView: v.boolean(),
  canCreate: v.boolean(),
  canUpdate: v.boolean(),
  canDelete: v.boolean(),
  createdBy: v.optional(v.id("users")),
  createdAt: v.optional(v.number()),
})
  .index("by_role", ["roleId"])
  .index("by_menu", ["menuItemId"])
  .index("by_role_menu", ["roleId", "menuItemId"]);

export const menus = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  slug: v.string(),
  config: v.object({
    items: v.array(v.object({})),
  }),
  createdBy: v.id("users"),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_slug", ["workspaceId", "slug"]);

export const menuSets = defineTable({
  ownerType: v.union(
    v.literal("system"),
    v.literal("workspace"),
    v.literal("user"),
    v.literal("cms"),
  ),
  ownerWorkspaceId: v.optional(v.id("workspaces")),
  ownerUserId: v.optional(v.id("users")),
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  isPublic: v.boolean(),
  createdBy: v.id("users"),
})
  .index("by_ownerType", ["ownerType"])
  .index("by_ownerWorkspace", ["ownerWorkspaceId"])
  .index("by_ownerUser", ["ownerUserId"])
  .index("by_slug", ["slug"]);

export const workspaceMenuAssignments = defineTable({
  workspaceId: v.id("workspaces"),
  menuSetId: v.id("menuSets"),
  isDefault: v.boolean(),
  order: v.number(),
  createdAt: v.optional(v.number()),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_menuSet", ["menuSetId"])
  .index("by_workspace_default", ["workspaceId", "isDefault"]);

export const userMenuAssignments = defineTable({
  userId: v.id("users"),
  menuSetId: v.id("menuSets"),
  scope: v.union(v.literal("global"), v.literal("workspace")),
  workspaceId: v.optional(v.id("workspaces")),
  isDefault: v.boolean(),
  order: v.number(),
  createdAt: v.optional(v.number()),
})
  .index("by_user", ["userId"])
  .index("by_menuSet", ["menuSetId"])
  .index("by_user_workspace", ["userId", "workspaceId"]);

export const components = defineTable({
  workspaceId: v.optional(v.id("workspaces")),
  key: v.string(),
  createdBy: v.id("users"),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_key", ["key"]);

export const componentVersions = defineTable({
  componentId: v.id("components"),
  version: v.string(),
  category: v.string(),
  type: v.union(
    v.literal("ui"),
    v.literal("layout"),
    v.literal("data"),
    v.literal("action"),
  ),
  propsSchema: v.optional(v.object({})),
  defaultProps: v.optional(v.object({})),
  slots: v.optional(v.object({})),
  status: v.union(
    v.literal("draft"),
    v.literal("active"),
    v.literal("deprecated"),
  ),
  schemaVersion: v.optional(v.number()),
  migrations: v.optional(v.object({})),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
})
  .index("by_component", ["componentId"])
  .index("by_component_version", ["componentId", "version"]);

export const componentAliases = defineTable({
  alias: v.string(),
  componentVersionId: v.id("componentVersions"),
  displayName: v.optional(v.string()),
  category: v.optional(v.string()),
  icon: v.optional(v.string()),
  description: v.optional(v.string()),
})
  .index("by_alias", ["alias"])
  .index("by_componentVersion", ["componentVersionId"]);

export const menuItemComponents = defineTable({
  menuItemId: v.id("menuItems"),
  componentVersionId: v.id("componentVersions"),
  slot: v.optional(v.string()),
  order: v.number(),
  props: v.optional(v.object({})),
  bindings: v.optional(v.object({})),
  layout: v.optional(v.object({})),
  visibility: v.optional(v.object({})),
  createdAt: v.optional(v.number()),
})
  .index("by_menuItem", ["menuItemId"])
  .index("by_componentVersion", ["componentVersionId"]);

export const menuTables = {
  menuItems,
  roleMenuPermissions,
  menus,
  menuSets,
  workspaceMenuAssignments,
  userMenuAssignments,
  components,
  componentVersions,
  componentAliases,
  menuItemComponents,
};
