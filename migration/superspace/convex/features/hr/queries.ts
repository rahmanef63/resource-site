import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"
import { assertDocWorkspace } from "../lib/rbac"

const HR_LIST_LIMIT = 200

/**
 * Queries for hr feature
 */

export const getData = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Get workspace members as employees
    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .take(1000)

    // Get user details for members
    const employees = await Promise.all(
      memberships.slice(0, 10).map(async (m) => {
        const user = await ctx.db.get(m.userId)
        return {
          id: m._id,
          name: user?.name || user?.email || "Unknown",
          role: "Member",
          department: "General",
          status: "active" as const,
          avatar: user?.avatarUrl || user?.image,
        }
      })
    )

    return {
      stats: {
        totalEmployees: memberships.length,
        onLeave: 0,
        openPositions: 0,
        newHires: memberships.filter(m => {
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
          return m._creationTime > thirtyDaysAgo
        }).length,
        departmentCount: 1,
      },
      recentHires: employees,
      leaveRequests: [],
    }
  },
})

export const listEmployees = query({
  args: {
    workspaceId: v.id("workspaces"),
    departmentId: v.optional(v.id("departments")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const limit = Math.min(args.limit ?? HR_LIST_LIMIT, HR_LIST_LIMIT)
    if (args.departmentId) {
      return await ctx.db
        .query("employees")
        .withIndex("by_department", (q) => q.eq("department", args.departmentId))
        .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
        .take(limit)
    }
    return await ctx.db
      .query("employees")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(limit)
  },
})

export const getEmployee = query({
  args: { workspaceId: v.id("workspaces"), employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const employee = await ctx.db.get(args.employeeId)
    assertDocWorkspace(employee, args.workspaceId, "employee")
    return employee
  },
})

export const listDepartments = query({
  args: { workspaceId: v.id("workspaces"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const limit = Math.min(args.limit ?? HR_LIST_LIMIT, HR_LIST_LIMIT)
    return await ctx.db
      .query("departments")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(limit)
  },
})

export const listLeaveRequests = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("cancelled"),
        v.literal("withdrawn"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const limit = Math.min(args.limit ?? HR_LIST_LIMIT, HR_LIST_LIMIT)
    const rows = await ctx.db
      .query("leaveRequests")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(limit)
    return args.status ? rows.filter((r) => r.status === args.status) : rows
  },
})

export const getLeaveRequest = query({
  args: { workspaceId: v.id("workspaces"), leaveId: v.id("leaveRequests") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const leave = await ctx.db.get(args.leaveId)
    assertDocWorkspace(leave, args.workspaceId, "leaveRequest")
    return leave
  },
})
