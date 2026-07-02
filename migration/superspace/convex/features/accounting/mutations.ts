import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import { assertDocWorkspace } from "../lib/rbac"

/**
 * Mutations for accounting feature
 * 
 * TODO: Implement Accounting-specific mutations:
 * - Journal entry creation
 * - Invoice generation
 * - Payment recording
 * - Account management
 * - Budget management
 */

export const createJournalEntry = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    description: v.string(),
    date: v.number(),
    entries: v.array(v.object({
      accountId: v.string(),
      debit: v.optional(v.number()),
      credit: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    // ✅ REQUIRED: Check permission
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.ACCOUNTING_MANAGE
    )

    // TODO: Implement journal entry creation logic
    // const entryId = await ctx.db.insert("accounting_journalEntries", { ... })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "accounting.journal_entry.create",
      resourceType: "accounting_journalEntry",
      resourceId: "temp_id", // Placeholder
      metadata: { description: args.description }
    })

    return {
      success: true,
      message: "Journal entry creation - not yet implemented",
    }
  },
})

export const updateJournalEntry = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    entryId: v.id("journalEntries"),
    description: v.optional(v.string()),
    reference: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("posted"),
        v.literal("reversed"),
        v.literal("void"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.ACCOUNTING_MANAGE)
    const entry = await ctx.db.get(args.entryId)
    assertDocWorkspace(entry, args.workspaceId, "journalEntry")
    if (entry!.status === "reversed" || entry!.status === "void") {
      throw new Error(`Cannot update entry in terminal state: ${entry!.status}`)
    }
    const patch: Record<string, unknown> = { updatedAt: Date.now() }
    if (args.description !== undefined) patch.description = args.description
    if (args.reference !== undefined) patch.reference = args.reference
    if (args.status !== undefined) patch.status = args.status
    await ctx.db.patch(args.entryId, patch as any)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership?.userId,
      action: "accounting.journal_entry.updated",
      resourceType: "journalEntry",
      resourceId: args.entryId,
      changes: patch,
    })
    return { success: true }
  },
})

export const deleteJournalEntry = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    entryId: v.id("journalEntries"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.ACCOUNTING_MANAGE)
    const entry = await ctx.db.get(args.entryId)
    assertDocWorkspace(entry, args.workspaceId, "journalEntry")
    if (entry!.status !== "draft") {
      throw new Error(`Only draft entries can be deleted (current status: ${entry!.status}). Use a reversing entry instead.`)
    }
    await ctx.db.delete(args.entryId)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership?.userId,
      action: "accounting.journal_entry.deleted",
      resourceType: "journalEntry",
      resourceId: args.entryId,
      metadata: { entryNumber: entry!.entryNumber, description: entry!.description },
    })
    return { success: true }
  },
})
