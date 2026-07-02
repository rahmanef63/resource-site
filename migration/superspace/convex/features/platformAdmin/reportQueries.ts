import { query } from "../../_generated/server"
import { v } from "convex/values"
import { ensureUser } from "../../auth/helpers"
import { isPlatformAdmin } from "../../lib/platformAdmin"
import { readIdentityEmail } from "../../lib/authIdentity"
import type { Doc } from "../../_generated/dataModel"

async function requirePlatformAdmin(ctx: Parameters<typeof ensureUser>[0]) {
  const userId = await ensureUser(ctx)
  const userDoc = (await ctx.db.get(userId)) as { email?: string } | null
  let email: string | null = userDoc?.email ?? null
  if (!email) {
    const identity = await ctx.auth.getUserIdentity()
    email = identity ? readIdentityEmail(identity) : null
  }
  if (!isPlatformAdmin(email)) {
    throw new Error("Platform admin access required")
  }
  return userId
}

const STATUS_VALUES = v.union(
  v.literal("open"),
  v.literal("triaged"),
  v.literal("resolved"),
  v.literal("wontfix"),
)

const SEVERITY_VALUES = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("critical"),
)

export const listErrorReports = query({
  args: {
    status: v.optional(STATUS_VALUES),
    severity: v.optional(SEVERITY_VALUES),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx)

    const rows = await ctx.db
      .query("errorReports")
      .withIndex("by_created")
      .order("desc")
      .take(args.limit ?? 100)

    const filtered = rows.filter((r) => {
      if (args.status && r.status !== args.status) return false
      if (args.severity && r.severity !== args.severity) return false
      return true
    })

    return Promise.all(
      filtered.map(async (row) => {
        const reporter = (await ctx.db.get(row.reporterUserId)) as Doc<"users"> | null
        const workspace = row.workspaceId
          ? ((await ctx.db.get(row.workspaceId)) as Doc<"workspaces"> | null)
          : null
        let screenshotUrl: string | null = null
        if (row.screenshotFileId) {
          const att = (await ctx.db.get(row.screenshotFileId)) as
            | Doc<"fileAttachments">
            | null
          if (att) {
            screenshotUrl = await ctx.storage.getUrl(att.storageId)
          }
        }
        return {
          ...row,
          reporterEmail: reporter?.email ?? null,
          reporterName: reporter?.name ?? null,
          workspaceName: workspace?.name ?? null,
          screenshotUrl,
        }
      }),
    )
  },
})

export const getErrorReportStats = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx)
    const open = await ctx.db
      .query("errorReports")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .take(500)
    return { openCount: open.length }
  },
})
