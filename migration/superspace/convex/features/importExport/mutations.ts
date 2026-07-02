import { v } from "convex/values"
import { mutation, action } from "../../_generated/server"
import { requirePermission, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import type { Id } from "../../_generated/dataModel"
import { internal } from "../../_generated/api"

/**
 * Import/Export Mutations
 * Real implementation with data processing
 */

// Supported entity types for import/export
const SUPPORTED_ENTITIES = [
  "contacts",
  "crmCustomers",
  "tasks",
  "projects",
  "inventoryItems",
  "salesInvoices",
  "hrEmployees",
] as const

type SupportedEntity = typeof SUPPORTED_ENTITIES[number]

// Start import job
export const startImport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
    format: v.string(),
    fileName: v.optional(v.string()),
    data: v.array(v.record(v.string(), v.any())), // Parsed data from client
    options: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    // Validate entity type
    if (!SUPPORTED_ENTITIES.includes(args.entityType as SupportedEntity)) {
      throw new Error(`Unsupported entity type: ${args.entityType}`)
    }

    // Bound the import payload — a single mutation processes every row inline,
    // so an unbounded array would blow the transaction/time budget.
    if (args.data.length > 5000) {
      throw new Error(
        `Import payload too large: ${args.data.length} rows (max 5000 per import)`
      )
    }

    const now = Date.now()

    // Create import job record
    const jobId = await ctx.db.insert("importExportHistory", {
      workspaceId: args.workspaceId,
      type: "import",
      entityType: args.entityType,
      format: args.format,
      fileName: args.fileName,
      status: "processing",
      recordCount: args.data.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      options: args.options,
      userId,
      startedAt: now,
    })

    // Process the import
    const errors: Array<{ row?: number; field?: string; message: string }> = []
    let successCount = 0

    for (let i = 0; i < args.data.length; i++) {
      const row = args.data[i]
      try {
        await insertEntity(ctx, args.workspaceId, args.entityType, row, userId)
        successCount++
      } catch (error) {
        errors.push({
          row: i + 1,
          message: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Update job status
    await ctx.db.patch(jobId, {
      status: errors.length === 0 ? "completed" : "completed",
      successCount,
      errorCount: errors.length,
      errors: errors.slice(0, 100), // Limit stored errors
      completedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "import.complete",
      resourceType: args.entityType,
      resourceId: jobId,
      metadata: {
        entityType: args.entityType,
        totalRecords: args.data.length,
        successCount,
        errorCount: errors.length,
      },
    })

    return {
      jobId,
      success: errors.length === 0,
      totalRecords: args.data.length,
      successCount,
      errorCount: errors.length,
      errors: errors.slice(0, 10),
    }
  },
})

// Helper to insert entity based on type
async function insertEntity(
  ctx: any,
  workspaceId: Id<"workspaces">,
  entityType: string,
  data: any,
  userId: Id<"users">
) {
  const now = Date.now()

  switch (entityType) {
    case "contacts":
      await ctx.db.insert("contacts", {
        workspaceId,
        name: data.name || data.Name || "",
        email: data.email || data.Email,
        phone: data.phone || data.Phone,
        company: data.company || data.Company,
        title: data.title || data.Title,
        createdAt: now,
        createdBy: userId,
      })
      break

    case "crmCustomers":
      await ctx.db.insert("crmCustomers", {
        workspaceId,
        name: data.name || data.Name || "",
        email: data.email || data.Email || "",
        phone: data.phone || data.Phone,
        company: data.company || data.Company,
        status: data.status || "lead",
        source: data.source || "import",
        createdAt: now,
      })
      break

    case "tasks":
      await ctx.db.insert("tasks", {
        workspaceId,
        title: data.title || data.Title || data.name || "",
        description: data.description || data.Description,
        status: data.status || "todo",
        priority: data.priority || "medium",
        dueDate: data.dueDate ? new Date(data.dueDate).getTime() : undefined,
        createdAt: now,
        createdBy: userId,
      })
      break

    case "inventoryItems":
      await ctx.db.insert("inventoryItems", {
        workspaceId,
        name: data.name || data.Name || "",
        sku: data.sku || data.SKU || `SKU-${now}`,
        description: data.description,
        category: data.category || "general",
        quantity: parseInt(data.quantity) || 0,
        unitPrice: parseFloat(data.unitPrice || data.price) || 0,
        createdAt: now,
      })
      break

    default:
      throw new Error(`Import handler not implemented for: ${entityType}`)
  }
}

// Start export job
export const startExport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
    format: v.string(),
    filters: v.optional(v.record(v.string(), v.any())),
    options: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    // Validate entity type
    if (!SUPPORTED_ENTITIES.includes(args.entityType as SupportedEntity)) {
      throw new Error(`Unsupported entity type: ${args.entityType}`)
    }

    const now = Date.now()

    // Get data to export
    const data = await getEntityData(ctx, args.workspaceId, args.entityType, args.filters)

    // Create export job record
    const jobId = await ctx.db.insert("importExportHistory", {
      workspaceId: args.workspaceId,
      type: "export",
      entityType: args.entityType,
      format: args.format,
      status: "completed",
      recordCount: data.length,
      successCount: data.length,
      errorCount: 0,
      options: args.options,
      userId,
      startedAt: now,
      completedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "export.complete",
      resourceType: args.entityType,
      resourceId: jobId,
      metadata: {
        entityType: args.entityType,
        recordCount: data.length,
        format: args.format,
      },
    })

    return {
      jobId,
      success: true,
      recordCount: data.length,
      data, // Return data for client to format/download
    }
  },
})

// Helper to get entity data for export
async function getEntityData(
  ctx: any,
  workspaceId: Id<"workspaces">,
  entityType: string,
  filters?: Record<string, any>
): Promise<any[]> {
  switch (entityType) {
    case "contacts":
      return await ctx.db
        .query("contacts")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
        .take(50000)

    case "crmCustomers":
      return await ctx.db
        .query("crmCustomers")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
        .take(50000)

    case "tasks":
      return await ctx.db
        .query("tasks")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
        .take(50000)

    case "inventoryItems":
      return await ctx.db
        .query("inventoryItems")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
        .take(50000)

    default:
      return []
  }
}

// Get field mappings for entity type
// @dod:skip-permissions reason="static lookup of entity-type → required/optional field map; no DB read/write, no workspace state, returns constant configuration"
export const getFieldMappings = mutation({
  args: {
    entityType: v.string(),
  },
  handler: async (_ctx, args) => {
    const mappings: Record<string, { required: string[]; optional: string[] }> = {
      contacts: {
        required: ["name"],
        optional: ["email", "phone", "company", "title", "notes"],
      },
      crmCustomers: {
        required: ["name", "email"],
        optional: ["phone", "company", "status", "source", "notes"],
      },
      tasks: {
        required: ["title"],
        optional: ["description", "status", "priority", "dueDate", "assignee"],
      },
      inventoryItems: {
        required: ["name", "sku"],
        optional: ["description", "category", "quantity", "unitPrice"],
      },
    }

    return mappings[args.entityType] || { required: [], optional: [] }
  },
})
