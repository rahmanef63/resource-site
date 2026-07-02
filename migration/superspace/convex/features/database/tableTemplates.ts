/**
 * Table Templates API
 * Feature #92 - Table templates for reusable table structures
 */

import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";

// =============================================================================
// Queries
// =============================================================================

/**
 * Get all table templates for a workspace
 */
export const getTemplates = query({
  args: {
    workspaceId: v.id("workspaces"),
    category: v.optional(v.string()),
    includeGlobal: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get workspace templates
    let templates = await ctx.db
      .query("dbTableTemplates")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000);

    // Filter by category if specified
    if (args.category) {
      templates = templates.filter((t) => t.category === args.category);
    }

    // Include global templates if requested
    if (args.includeGlobal) {
      const globalTemplates = await ctx.db
        .query("dbTableTemplates")
        .withIndex("by_global", (q) => q.eq("isGlobal", true))
        .take(1000);

      // Merge and dedupe
      const templateIds = new Set(templates.map((t) => t._id));
      for (const gt of globalTemplates) {
        if (!templateIds.has(gt._id)) {
          templates.push(gt);
        }
      }
    }

    return templates;
  },
});

/**
 * Get a single template by ID
 */
export const getTemplate = query({
  args: {
    templateId: v.id("dbTableTemplates"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.templateId);
  },
});

/**
 * Get templates by category
 */
export const getTemplatesByCategory = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dbTableTemplates")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .take(1000);
  },
});

/**
 * Get global templates (available to all workspaces)
 */
export const getGlobalTemplates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("dbTableTemplates")
      .withIndex("by_global", (q) => q.eq("isGlobal", true))
      .take(1000);
  },
});

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create a new table template
 */
export const createTemplate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    category: v.optional(v.string()),
    fields: v.array(
      v.object({
        name: v.string(),
        type: v.string(),
        options: v.optional(v.any()),
        isRequired: v.optional(v.boolean()),
        defaultValue: v.optional(v.any()),
      })
    ),
    defaultViews: v.optional(
      v.array(
        v.object({
          name: v.string(),
          type: v.string(),
          config: v.optional(v.any()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const templateId = await ctx.db.insert("dbTableTemplates", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      icon: args.icon,
      category: args.category,
      fields: args.fields,
      defaultViews: args.defaultViews,
      isGlobal: false,
      isPublished: false,
      usageCount: 0,
      createdById: user._id,
      createdAt: Date.now(),
    });

    return templateId;
  },
});

/**
 * Create a template from an existing table
 */
export const createTemplateFromTable = mutation({
  args: {
    tableId: v.id("dbTables"),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the source table
    const table = await ctx.db.get(args.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    // Get all fields from the table
    const fields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(1000);

    // Get all views from the table
    const views = await ctx.db
      .query("dbViews")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(1000);

    // Convert fields to template format
    const templateFields = fields.map((f) => ({
      name: f.name,
      type: f.type,
      options: f.options,
      isRequired: f.isRequired,
      defaultValue: f.defaultValue,
    }));

    // Convert views to template format
    const templateViews = views.map((v) => ({
      name: v.name,
      type: v.type,
      config: v.settings,
    }));

    const templateId = await ctx.db.insert("dbTableTemplates", {
      workspaceId: table.workspaceId,
      name: args.name,
      description: args.description || `Template created from ${table.name}`,
      icon: table.icon,
      category: args.category,
      fields: templateFields,
      defaultViews: templateViews.length > 0 ? templateViews : undefined,
      isGlobal: false,
      isPublished: false,
      usageCount: 0,
      createdById: user._id,
      createdAt: Date.now(),
    });

    return templateId;
  },
});

/**
 * Apply a template to create a new table
 */
export const applyTemplate = mutation({
  args: {
    templateId: v.id("dbTableTemplates"),
    workspaceId: v.id("workspaces"),
    databaseId: v.id("universalDatabases"),
    tableName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the template
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Create the table
    const tableId = await ctx.db.insert("dbTables", {
      workspaceId: args.workspaceId,
      name: args.tableName,
      icon: template.icon,
      description: template.description,
      isTemplate: false,
      settings: {
        showProperties: true,
        wrapCells: false,
        showCalculations: false,
      },
      createdById: user._id,
      updatedById: user._id,
      createdAt: Date.now(),
    });

    // Create fields from template
    for (let i = 0; i < template.fields.length; i++) {
      const field = template.fields[i];
      await ctx.db.insert("dbFields", {
        tableId,
        name: field.name,
        type: field.type as any,
        options: field.options,
        isRequired: field.isRequired ?? false,
        defaultValue: field.defaultValue,
        position: i,
        createdAt: Date.now(),
      });
    }

    // Create views from template if any
    const defaultSettings = {
      filters: [],
      sorts: [],
      visibleFields: [],
    };

    if (template.defaultViews) {
      for (const view of template.defaultViews) {
        await ctx.db.insert("dbViews", {
          tableId,
          name: view.name,
          type: view.type as any,
          settings: view.config ?? defaultSettings,
          isDefault: view.name === "Default",
          createdById: user._id,
          createdAt: Date.now(),
        });
      }
    } else {
      // Create a default table view
      await ctx.db.insert("dbViews", {
        tableId,
        name: "Default",
        type: "table",
        settings: defaultSettings,
        isDefault: true,
        createdById: user._id,
        createdAt: Date.now(),
      });
    }

    // Increment usage count
    await ctx.db.patch(args.templateId, {
      usageCount: (template.usageCount || 0) + 1,
    });

    return tableId;
  },
});

/**
 * Update a template
 */
export const updateTemplate = mutation({
  args: {
    templateId: v.id("dbTableTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    category: v.optional(v.string()),
    fields: v.optional(
      v.array(
        v.object({
          name: v.string(),
          type: v.string(),
          options: v.optional(v.any()),
          isRequired: v.optional(v.boolean()),
          defaultValue: v.optional(v.any()),
        })
      )
    ),
    defaultViews: v.optional(
      v.array(
        v.object({
          name: v.string(),
          type: v.string(),
          config: v.optional(v.any()),
        })
      )
    ),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { templateId, ...updates } = args;

    const template = await ctx.db.get(templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    await ctx.db.patch(templateId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return templateId;
  },
});

/**
 * Delete a template
 */
export const deleteTemplate = mutation({
  args: {
    templateId: v.id("dbTableTemplates"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    await ctx.db.delete(args.templateId);
    return true;
  },
});

/**
 * Duplicate a template
 */
export const duplicateTemplate = mutation({
  args: {
    templateId: v.id("dbTableTemplates"),
    newName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    const newTemplateId = await ctx.db.insert("dbTableTemplates", {
      workspaceId: template.workspaceId,
      name: args.newName || `${template.name} (Copy)`,
      description: template.description,
      icon: template.icon,
      category: template.category,
      fields: template.fields,
      defaultViews: template.defaultViews,
      isGlobal: false,
      isPublished: false,
      usageCount: 0,
      createdById: user._id,
      createdAt: Date.now(),
    });

    return newTemplateId;
  },
});
