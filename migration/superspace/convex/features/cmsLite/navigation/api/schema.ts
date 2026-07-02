import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  navigationItems: defineTable({
    workspaceId: v.string(),
    key: v.string(), // Unique identifier for the item
    parentKey: v.optional(v.string()), // Parent item's key
    type: v.string(), // link, dropdown, mega-menu, etc.
    status: v.string(), // active, inactive, draft
    displayOrder: v.number(),
    translations: v.record(v.string(), v.object({
      label: v.string(),
      description: v.optional(v.string()),
      ariaLabel: v.optional(v.string()),
    })),
    path: v.optional(v.string()),
    isExternal: v.boolean(),
    target: v.optional(v.string()), // _blank, _self, etc.
    icon: v.optional(v.string()),
    data: v.optional(v.object({
      badge: v.optional(v.object({
        text: v.string(),
        variant: v.optional(v.string()),
      })),
      megaMenu: v.optional(v.object({
        columns: v.number(),
        layout: v.string(),
        sections: v.array(v.object({
          title: v.optional(v.string()),
          links: v.array(v.object({
            label: v.string(),
            path: v.string(),
            description: v.optional(v.string()),
            icon: v.optional(v.string()),
          })),
        })),
      })),
      featuredItems: v.optional(v.array(v.object({
        type: v.string(),
        id: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        image: v.optional(v.string()),
      }))),
    })),
    metadata: v.optional(v.object({
      roles: v.optional(v.array(v.string())), // Required roles to see this item
      devices: v.optional(v.array(v.string())), // desktop, mobile, tablet
      analyticsId: v.optional(v.string()),
      customClass: v.optional(v.string()),
    })),
    createdAt: v.number(),
    createdBy: v.optional(v.string()),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  })
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_status", ["workspaceId", "status"])
  .index("by_parent", ["workspaceId", "parentKey"])
  .index("by_order", ["workspaceId", "displayOrder"]),

  navigationGroups: defineTable({
    workspaceId: v.string(),
    name: v.string(), // header, footer, sidebar, etc.
    status: v.string(), // active, inactive
    displayOrder: v.number(),
    translations: v.record(v.string(), v.object({
      title: v.string(),
      description: v.optional(v.string()),
    })),
    items: v.array(v.string()), // Array of navigation item keys
    settings: v.optional(v.object({
      layout: v.optional(v.string()),
      theme: v.optional(v.string()),
      sticky: v.optional(v.boolean()),
      maxDepth: v.optional(v.number()),
      expandBehavior: v.optional(v.string()),
    })),
    metadata: v.optional(v.object({
      roles: v.optional(v.array(v.string())),
      devices: v.optional(v.array(v.string())),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_name", ["workspaceId", "name"])
  .index("by_order", ["workspaceId", "displayOrder"]),
});
