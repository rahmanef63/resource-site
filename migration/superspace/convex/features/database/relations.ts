/**
 * Relations API (Features #89, #90)
 * Two-way relations and many-to-many relation support
 */
import { query, mutation, internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { PERMISSIONS } from "../../workspace/permissions";
import { logAuditEvent } from "../../shared/audit";

// ============ RELATION CONFIG ============

/**
 * Create a relation configuration
 */
export const createRelationConfig = mutation({
  args: {
    sourceFieldId: v.id("dbFields"),
    sourceTableId: v.id("dbTables"),
    targetTableId: v.id("dbTables"),
    relationType: v.union(
      v.literal("oneToOne"),
      v.literal("oneToMany"),
      v.literal("manyToOne"),
      v.literal("manyToMany")
    ),
    isTwoWay: v.boolean(),
    inverseFieldName: v.optional(v.string()),
    onDelete: v.union(
      v.literal("setNull"),
      v.literal("cascade"),
      v.literal("restrict")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const sourceTable = await ctx.db.get(args.sourceTableId);
    if (!sourceTable) throw new Error("Source table not found");

    const targetTable = await ctx.db.get(args.targetTableId);
    if (!targetTable) throw new Error("Target table not found");

    await requirePermission(
      ctx,
      sourceTable.workspaceId,
      PERMISSIONS.DATABASE_UPDATE
    );

    const now = Date.now();
    let inverseFieldId: typeof args.sourceFieldId | undefined;
    let junctionTableId: typeof args.sourceTableId | undefined;

    // For two-way relations, create the inverse field
    if (args.isTwoWay) {
      const existingFields = await ctx.db
        .query("dbFields")
        .withIndex("by_table", (q) => q.eq("tableId", args.targetTableId))
        .take(1000);

      const maxPosition = Math.max(0, ...existingFields.map((f) => f.position));
      const inverseName =
        args.inverseFieldName ?? `${sourceTable.name} (Linked)`;

      inverseFieldId = await ctx.db.insert("dbFields", {
        tableId: args.targetTableId,
        name: inverseName,
        type: "relation",
        options: {
          selectOptions: [],
        },
        isRequired: false,
        position: maxPosition + 1,
        createdAt: now,
        updatedAt: now,
      });
    }

    // For M2M relations, create a junction table
    if (args.relationType === "manyToMany") {
      junctionTableId = await ctx.db.insert("dbTables", {
        workspaceId: sourceTable.workspaceId,
        name: `${sourceTable.name}_${targetTable.name}_junction`,
        description: `Junction table for ${sourceTable.name} <-> ${targetTable.name}`,
        icon: "🔗",
        createdById: userId,
        updatedById: userId,
        isTemplate: false,
        settings: {
          showProperties: false,
          wrapCells: false,
          showCalculations: false,
        },
        createdAt: now,
        updatedAt: now,
      });
    }

    const configId = await ctx.db.insert("dbRelationConfigs", {
      sourceFieldId: args.sourceFieldId,
      sourceTableId: args.sourceTableId,
      targetTableId: args.targetTableId,
      relationType: args.relationType,
      isTwoWay: args.isTwoWay,
      inverseFieldId,
      inverseFieldName: args.inverseFieldName,
      junctionTableId,
      onDelete: args.onDelete,
      createdAt: now,
      updatedAt: now,
    });

    await logAuditEvent(ctx, {
      action: "relationConfig.create",
      resourceType: "dbRelationConfigs",
      resourceId: configId,
      workspaceId: sourceTable.workspaceId,
      userId,
      metadata: {
        sourceTable: sourceTable.name,
        targetTable: targetTable.name,
        relationType: args.relationType,
        isTwoWay: args.isTwoWay,
      },
    });

    return { configId, inverseFieldId, junctionTableId };
  },
});

/**
 * Get relation config for a field
 */
export const getRelationConfig = query({
  args: {
    fieldId: v.id("dbFields"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return ctx.db
      .query("dbRelationConfigs")
      .withIndex("by_source_field", (q) => q.eq("sourceFieldId", args.fieldId))
      .first();
  },
});

/**
 * List relation configs for a table
 */
export const listRelationConfigs = query({
  args: {
    tableId: v.id("dbTables"),
    direction: v.optional(v.union(v.literal("source"), v.literal("target"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.direction === "target") {
      return ctx.db
        .query("dbRelationConfigs")
        .withIndex("by_target_table", (q) => q.eq("targetTableId", args.tableId))
        .take(1000);
    }

    if (args.direction === "source") {
      return ctx.db
        .query("dbRelationConfigs")
        .withIndex("by_source_table", (q) => q.eq("sourceTableId", args.tableId))
        .take(1000);
    }

    // Both directions
    const [source, target] = await Promise.all([
      ctx.db
        .query("dbRelationConfigs")
        .withIndex("by_source_table", (q) => q.eq("sourceTableId", args.tableId))
        .take(1000),
      ctx.db
        .query("dbRelationConfigs")
        .withIndex("by_target_table", (q) => q.eq("targetTableId", args.tableId))
        .take(1000),
    ]);

    return [...source, ...target];
  },
});

/**
 * Update relation config
 */
export const updateRelationConfig = mutation({
  args: {
    configId: v.id("dbRelationConfigs"),
    inverseFieldName: v.optional(v.string()),
    onDelete: v.optional(
      v.union(
        v.literal("setNull"),
        v.literal("cascade"),
        v.literal("restrict")
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const config = await ctx.db.get(args.configId);
    if (!config) throw new Error("Relation config not found");

    const sourceTable = await ctx.db.get(config.sourceTableId);
    if (!sourceTable) throw new Error("Source table not found");

    await requirePermission(
      ctx,
      sourceTable.workspaceId,
      PERMISSIONS.DATABASE_UPDATE
    );

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.inverseFieldName !== undefined) {
      updates.inverseFieldName = args.inverseFieldName;
      // Also update the inverse field name if it exists
      if (config.inverseFieldId) {
        await ctx.db.patch(config.inverseFieldId, {
          name: args.inverseFieldName,
          updatedAt: Date.now(),
        });
      }
    }
    if (args.onDelete !== undefined) updates.onDelete = args.onDelete;

    await ctx.db.patch(args.configId, updates);

    await logAuditEvent(ctx, {
      action: "relationConfig.update",
      resourceType: "dbRelationConfigs",
      resourceId: args.configId,
      workspaceId: sourceTable.workspaceId,
      userId,
      metadata: {},
    });

    return args.configId;
  },
});

/**
 * Delete relation config
 */
export const deleteRelationConfig = mutation({
  args: {
    configId: v.id("dbRelationConfigs"),
    deleteInverseField: v.optional(v.boolean()),
    deleteJunctionTable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const config = await ctx.db.get(args.configId);
    if (!config) throw new Error("Relation config not found");

    const sourceTable = await ctx.db.get(config.sourceTableId);
    if (!sourceTable) throw new Error("Source table not found");

    await requirePermission(
      ctx,
      sourceTable.workspaceId,
      PERMISSIONS.DATABASE_DELETE
    );

    // Delete junction entries first
    if (config.junctionTableId) {
      const junctions = await ctx.db
        .query("dbRelationJunctions")
        .withIndex("by_config", (q) => q.eq("relationConfigId", args.configId))
        .take(1000);

      for (const junction of junctions) {
        await ctx.db.delete(junction._id);
      }
    }

    // Optionally delete inverse field
    if (args.deleteInverseField && config.inverseFieldId) {
      await ctx.db.delete(config.inverseFieldId);
    }

    // Optionally delete junction table
    if (args.deleteJunctionTable && config.junctionTableId) {
      await ctx.db.delete(config.junctionTableId);
    }

    await ctx.db.delete(args.configId);

    await logAuditEvent(ctx, {
      action: "relationConfig.delete",
      resourceType: "dbRelationConfigs",
      resourceId: args.configId,
      workspaceId: sourceTable.workspaceId,
      userId,
      metadata: {},
    });

    return true;
  },
});

// ============ M2M JUNCTION OPERATIONS ============

/**
 * Link two rows (for M2M relations)
 */
export const linkRows = mutation({
  args: {
    relationConfigId: v.id("dbRelationConfigs"),
    sourceRowId: v.id("dbRows"),
    targetRowId: v.id("dbRows"),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const config = await ctx.db.get(args.relationConfigId);
    if (!config) throw new Error("Relation config not found");

    if (config.relationType !== "manyToMany") {
      throw new Error("linkRows is only for M2M relations");
    }

    const sourceRow = await ctx.db.get(args.sourceRowId);
    if (!sourceRow) throw new Error("Source row not found");

    await requirePermission(
      ctx,
      sourceRow.workspaceId,
      PERMISSIONS.DATABASE_UPDATE
    );

    // Check if link already exists
    const existing = await ctx.db
      .query("dbRelationJunctions")
      .withIndex("by_source_target", (q) =>
        q.eq("sourceRowId", args.sourceRowId).eq("targetRowId", args.targetRowId)
      )
      .first();

    if (existing) {
      // Update metadata if provided
      if (args.metadata) {
        await ctx.db.patch(existing._id, { metadata: args.metadata });
      }
      return existing._id;
    }

    const junctionId = await ctx.db.insert("dbRelationJunctions", {
      relationConfigId: args.relationConfigId,
      sourceRowId: args.sourceRowId,
      targetRowId: args.targetRowId,
      metadata: args.metadata,
      createdById: userId,
      createdAt: Date.now(),
    });

    await logAuditEvent(ctx, {
      action: "relation.link",
      resourceType: "dbRelationJunctions",
      resourceId: junctionId,
      workspaceId: sourceRow.workspaceId,
      userId,
      metadata: {
        sourceRowId: args.sourceRowId,
        targetRowId: args.targetRowId,
      },
    });

    return junctionId;
  },
});

/**
 * Unlink two rows
 */
export const unlinkRows = mutation({
  args: {
    sourceRowId: v.id("dbRows"),
    targetRowId: v.id("dbRows"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const junction = await ctx.db
      .query("dbRelationJunctions")
      .withIndex("by_source_target", (q) =>
        q.eq("sourceRowId", args.sourceRowId).eq("targetRowId", args.targetRowId)
      )
      .first();

    if (!junction) {
      // Try reverse
      const reverseJunction = await ctx.db
        .query("dbRelationJunctions")
        .withIndex("by_source_target", (q) =>
          q.eq("sourceRowId", args.targetRowId).eq("targetRowId", args.sourceRowId)
        )
        .first();

      if (!reverseJunction) return false;

      const sourceRow = await ctx.db.get(args.targetRowId);
      if (sourceRow) {
        await requirePermission(
          ctx,
          sourceRow.workspaceId,
          PERMISSIONS.DATABASE_UPDATE
        );
      }

      await ctx.db.delete(reverseJunction._id);

      if (sourceRow) {
        await logAuditEvent(ctx, {
          action: "relation.unlink",
          resourceType: "dbRelationJunctions",
          resourceId: reverseJunction._id,
          workspaceId: sourceRow.workspaceId,
          userId,
          metadata: {
            sourceRowId: args.targetRowId,
            targetRowId: args.sourceRowId,
          },
        });
      }

      return true;
    }

    const sourceRow = await ctx.db.get(args.sourceRowId);
    if (sourceRow) {
      await requirePermission(
        ctx,
        sourceRow.workspaceId,
        PERMISSIONS.DATABASE_UPDATE
      );
    }

    await ctx.db.delete(junction._id);

    if (sourceRow) {
      await logAuditEvent(ctx, {
        action: "relation.unlink",
        resourceType: "dbRelationJunctions",
        resourceId: junction._id,
        workspaceId: sourceRow.workspaceId,
        userId,
        metadata: {
          sourceRowId: args.sourceRowId,
          targetRowId: args.targetRowId,
        },
      });
    }

    return true;
  },
});

/**
 * Get linked rows for a row
 */
export const getLinkedRows = query({
  args: {
    rowId: v.id("dbRows"),
    relationConfigId: v.optional(v.id("dbRelationConfigs")),
    direction: v.optional(v.union(v.literal("source"), v.literal("target"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let junctions: Array<{
      _id: any;
      relationConfigId: any;
      sourceRowId: any;
      targetRowId: any;
      metadata?: any;
      createdAt: number;
    }> = [];

    // Get junctions where this row is source
    if (args.direction !== "target") {
      const sourceJunctions = await ctx.db
        .query("dbRelationJunctions")
        .withIndex("by_source", (q) => q.eq("sourceRowId", args.rowId))
        .take(1000);
      junctions.push(...sourceJunctions);
    }

    // Get junctions where this row is target
    if (args.direction !== "source") {
      const targetJunctions = await ctx.db
        .query("dbRelationJunctions")
        .withIndex("by_target", (q) => q.eq("targetRowId", args.rowId))
        .take(1000);
      junctions.push(...targetJunctions);
    }

    // Filter by config if provided
    if (args.relationConfigId) {
      junctions = junctions.filter(
        (j) => j.relationConfigId === args.relationConfigId
      );
    }

    // Enrich with row data
    const enriched = await Promise.all(
      junctions.map(async (j) => {
        const linkedRowId =
          j.sourceRowId === args.rowId ? j.targetRowId : j.sourceRowId;
        const linkedRow = await ctx.db.get(linkedRowId);
        return {
          junctionId: j._id,
          linkedRowId,
          linkedRow,
          metadata: j.metadata,
          direction: j.sourceRowId === args.rowId ? "outgoing" : "incoming",
          createdAt: j.createdAt,
        };
      })
    );

    return enriched.filter((e) => e.linkedRow !== null);
  },
});

/**
 * Sync two-way relation (internal - called when source relation changes)
 */
export const syncTwoWayRelation = internalMutation({
  args: {
    configId: v.id("dbRelationConfigs"),
    sourceRowId: v.id("dbRows"),
    linkedRowIds: v.array(v.id("dbRows")),
    changedById: v.id("users"),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db.get(args.configId);
    if (!config || !config.isTwoWay || !config.inverseFieldId) return;

    // For each linked row, update the inverse field to include the source row
    for (const targetRowId of args.linkedRowIds) {
      const targetRow = await ctx.db.get(targetRowId);
      if (!targetRow) continue;

      const inverseFieldId = config.inverseFieldId as string;
      const currentInverseValue = targetRow.data[inverseFieldId] || [];
      const newInverseValue = Array.isArray(currentInverseValue)
        ? currentInverseValue
        : [currentInverseValue];

      // Add source row if not already there
      if (!newInverseValue.includes(args.sourceRowId)) {
        newInverseValue.push(args.sourceRowId);
        await ctx.db.patch(targetRowId, {
          data: {
            ...targetRow.data,
            [inverseFieldId]: newInverseValue,
          },
          updatedById: args.changedById,
          updatedAt: Date.now(),
        });
      }
    }
  },
});
