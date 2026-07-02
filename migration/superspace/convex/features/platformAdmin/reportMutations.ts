import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser } from "../../auth/helpers"
import { isPlatformAdmin } from "../../lib/platformAdmin"
import { resolveAuthEmail } from "../../lib/authIdentity"
import { logAuditEvent } from "../../shared/audit"

async function requirePlatformAdmin(ctx: Parameters<typeof ensureUser>[0]) {
  const userId = await ensureUser(ctx)
  const email = await resolveAuthEmail(ctx)
  if (!isPlatformAdmin(email)) {
    throw new Error("Platform admin access required")
  }
  return userId
}

const MAX_STACK = 20_000
const MAX_TEXT = 5_000

function truncate(value: string | undefined, limit: number): string | undefined {
  if (value == null) return undefined
  return value.length > limit ? value.slice(0, limit) : value
}

const SEVERITY_VALIDATOR = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("critical"),
)

const STATUS_VALIDATOR = v.union(
  v.literal("open"),
  v.literal("triaged"),
  v.literal("resolved"),
  v.literal("wontfix"),
)

export const createErrorReport = mutation({
  args: {
    severity: SEVERITY_VALIDATOR,
    title: v.string(),
    userNote: v.optional(v.string()),
    errorMessage: v.string(),
    errorName: v.optional(v.string()),
    errorStack: v.optional(v.string()),
    route: v.optional(v.string()),
    endpoint: v.optional(v.string()),
    featureId: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    appVersion: v.optional(v.string()),
    viewport: v.optional(
      v.object({
        w: v.number(),
        h: v.number(),
      }),
    ),
    workspaceId: v.optional(v.id("workspaces")),
    screenshotFileId: v.optional(v.id("fileAttachments")),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)

    const reportId = await ctx.db.insert("errorReports", {
      reporterUserId: userId,
      workspaceId: args.workspaceId,
      status: "open",
      severity: args.severity,
      title: truncate(args.title, 200)!,
      userNote: truncate(args.userNote, MAX_TEXT),
      errorMessage: truncate(args.errorMessage, MAX_TEXT)!,
      errorName: truncate(args.errorName, 200),
      errorStack: truncate(args.errorStack, MAX_STACK),
      route: truncate(args.route, 500),
      endpoint: truncate(args.endpoint, 200),
      featureId: truncate(args.featureId, 100),
      userAgent: truncate(args.userAgent, 500),
      appVersion: truncate(args.appVersion, 100),
      viewport: args.viewport,
      screenshotFileId: args.screenshotFileId,
      createdAt: Date.now(),
    })

    // logAuditEvent throws when workspaceId is missing — gate the call.
    if (args.workspaceId) {
      await logAuditEvent(ctx, {
        workspaceId: args.workspaceId,
        actorUserId: userId,
        action: "platform-admin.error_report.created",
        resourceType: "errorReports",
        resourceId: reportId,
        metadata: {
          severity: args.severity,
          featureId: args.featureId,
          route: args.route,
        },
      })
    }

    return reportId
  },
})

export const updateErrorReportStatus = mutation({
  args: {
    id: v.id("errorReports"),
    status: STATUS_VALIDATOR,
    resolutionNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actorUserId = await requirePlatformAdmin(ctx)

    const report = await ctx.db.get(args.id)
    if (!report) throw new Error("Error report not found")

    const patch: Record<string, unknown> = { status: args.status }

    if (args.status === "triaged" && !report.triagedAt) {
      patch.triagedBy = actorUserId
      patch.triagedAt = Date.now()
    }

    if (args.resolutionNote !== undefined) {
      patch.resolutionNote = truncate(args.resolutionNote, MAX_TEXT)
    }

    await ctx.db.patch(args.id, patch)

    if (report.workspaceId) {
      await logAuditEvent(ctx, {
        workspaceId: report.workspaceId,
        actorUserId,
        action: "platform-admin.error_report.status_changed",
        resourceType: "errorReports",
        resourceId: args.id,
        metadata: {
          fromStatus: report.status,
          toStatus: args.status,
        },
      })
    }
  },
})
