import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";
import { getUserByExternalId, requirePermission } from "../auth";

const fieldValidator = v.object({
  fieldId: v.string(),
  name: v.string(),
  label: v.string(),
  description: v.optional(v.string()),
  type: v.union(
    v.literal("text"),
    v.literal("textarea"),
    v.literal("number"),
    v.literal("currency"),
    v.literal("date"),
    v.literal("datetime"),
    v.literal("boolean"),
    v.literal("select"),
    v.literal("multiselect"),
    v.literal("email"),
    v.literal("phone"),
    v.literal("url"),
    v.literal("file"),
  ),
  required: v.boolean(),
  unique: v.boolean(),
  defaultValue: v.optional(v.any()),
  options: v.optional(v.array(v.string())),
  validation: v.optional(
    v.object({
      min: v.optional(v.number()),
      max: v.optional(v.number()),
      pattern: v.optional(v.string()),
      custom: v.optional(v.string()),
    }),
  ),
  permissions: v.optional(v.array(v.string())),
  order: v.number(),
});

export const defineCustomFields = mutation({
  args: {
    entity: v.string(),
    fields: v.array(fieldValidator),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, { entity, fields, workspaceId }) => {
    await requirePermission(ctx, workspaceId, `${entity}.custom_fields.manage`);
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await getUserByExternalId(ctx, identity.subject);
    if (!user) throw new Error("User not found");

    const created: string[] = [];
    for (const field of fields) {
      const existing = await ctx.db
        .query("customFieldDefinitions")
        .withIndex("by_fieldId", (q) => q.eq("fieldId", field.fieldId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { ...field, updatedAt: Date.now() });
        created.push(existing._id);
      } else {
        const id = await ctx.db.insert("customFieldDefinitions", {
          workspaceId,
          entity,
          ...field,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          createdBy: user._id,
        });
        created.push(id);
      }
    }
    return { success: true, fieldIds: created };
  },
});

export const getCustomFields = query({
  args: {
    entity: v.string(),
    workspaceId: v.id("workspaces"),
    includeInactive: v.boolean(),
  },
  handler: async (ctx, { entity, workspaceId, includeInactive }) => {
    await requirePermission(ctx, workspaceId, `${entity}.read`);
    let q = ctx.db
      .query("customFieldDefinitions")
      .withIndex("by_workspace_entity", (idx) =>
        idx.eq("workspaceId", workspaceId).eq("entity", entity),
      );
    if (!includeInactive) {
      q = q.filter((f) => f.eq(f.field("isActive"), true));
    }
    return q.order("asc").take(1000);
  },
});

export const getCustomFieldValues = query({
  args: {
    entity: v.string(),
    entityId: v.id("users"), // Generic Id<_table> would require template; keep users for compatibility
    workspaceId: v.id("workspaces"),
    fieldIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { entity, entityId, workspaceId, fieldIds }) => {
    await requirePermission(ctx, workspaceId, `${entity}.read`);
    let q = ctx.db
      .query("customFieldValues")
      .withIndex("by_entity", (idx) => idx.eq("entity", entity).eq("entityId", entityId));
    if (fieldIds && fieldIds.length > 0) {
      q = q.filter((f) => f.or(...fieldIds.map((id) => f.eq(f.field("fieldId"), id))));
    }
    const values = await q.collect();
    const map: Record<string, any> = {};
    for (const val of values) {
      map[val.fieldId] = val.value;
    }
    return map;
  },
});

export const setCustomFieldValue = mutation({
  args: {
    entity: v.string(),
    entityId: v.id("users"),
    fieldId: v.string(),
    value: v.any(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, { entity, entityId, fieldId, value, workspaceId }) => {
    await requirePermission(ctx, workspaceId, `${entity}.write`);
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await getUserByExternalId(ctx, identity.subject);
    if (!user) throw new Error("User not found");

    const fieldDef = await ctx.db
      .query("customFieldDefinitions")
      .withIndex("by_fieldId", (q) => q.eq("fieldId", fieldId))
      .first();

    if (!fieldDef || !fieldDef.isActive) throw new Error("Field not found or inactive");

    const existing = await ctx.db
      .query("customFieldValues")
      .withIndex("by_field", (idx) => idx.eq("fieldId", fieldId).eq("entityId", entityId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    } else {
      await ctx.db.insert("customFieldValues", {
        workspaceId,
        entity,
        entityId,
        fieldId,
        value,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    }
    return { success: true };
  },
});
