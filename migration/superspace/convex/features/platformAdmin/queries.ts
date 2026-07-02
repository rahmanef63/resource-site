import { query } from "../../_generated/server"
import { v } from "convex/values"
import { ensureUser } from "../../auth/helpers"
import { isPlatformAdmin, getPlatformAdminEmails } from "../../lib/platformAdmin"
import { readIdentityEmail } from "../../lib/authIdentity"

/**
 * Platform Admin Queries
 * System-level read operations — platform admin only
 */

async function requirePlatformAdmin(ctx: Parameters<typeof ensureUser>[0]) {
  const userId = await ensureUser(ctx)
  // Convex Auth's JWT carries no `email` claim — identity.email is always
  // undefined for cutover users. Resolve email from the users doc itself
  // (loaded by ensureUser → ctx.db.get). The legacy identity helper is
  // kept as a fallback for dual-period callers carrying Clerk JWTs.
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

export const getSystemStats = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx)

    const [workspaces, users] = await Promise.all([
      ctx.db.query("workspaces").take(1000),
      ctx.db.query("users").take(1000),
    ])

    const activeWorkspaces = workspaces.filter((w) => !w.isArchived && !w.isDeleted)

    return {
      totalWorkspaces: workspaces.length,
      activeWorkspaces: activeWorkspaces.length,
      totalUsers: users.length,
    }
  },
})

export const getAllWorkspaces = query({
  args: {
    limit: v.optional(v.number()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx)

    const workspaces = await ctx.db
      .query("workspaces")
      .order("desc")
      .take(args.limit ?? 50)

    if (args.type) {
      return workspaces.filter((w) => w.type === args.type)
    }
    return workspaces
  },
})

export const getAllUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx)

    return ctx.db
      .query("users")
      .take(args.limit ?? 100)
  },
})

export const getAuditLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx)

    return ctx.db
      .query("activityEvents")
      .order("desc")
      .take(args.limit ?? 100)
  },
})

export const getAdminInfo = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx)

    const emails = getPlatformAdminEmails()
    const maskedEmails = emails.map((email) => {
      const [local, domain] = email.split("@")
      if (!domain) return "***"
      return `${local.slice(0, 3)}***@${domain}`
    })

    return {
      count: emails.length,
      maskedEmails,
    }
  },
})
