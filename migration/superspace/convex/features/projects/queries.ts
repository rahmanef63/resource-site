import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getExistingUserId, requireActiveMembership } from "../../auth/helpers";

// Document shape of the `projects` table (mirrors api/schema.ts).
// Used to build concrete return validators instead of v.any().
const projectFields = {
  _id: v.id("projects"),
  _creationTime: v.number(),
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  status: v.union(
    v.literal("planning"),
    v.literal("active"),
    v.literal("on_hold"),
    v.literal("completed"),
    v.literal("archived"),
  ),
  priority: v.optional(
    v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  ),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  conversationId: v.optional(v.id("conversations")),
  createdBy: v.id("users"),
  ownerId: v.id("users"),
  metadata: v.optional(v.any()),
};

/**
 * Get all projects in a workspace
 */
export const getWorkspaceProjects = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.union(
      v.literal("planning"),
      v.literal("active"),
      v.literal("on_hold"),
      v.literal("completed"),
      v.literal("archived"),
    )),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    // IDOR gate (P0-1): caller must be an active member of this workspace.
    await requireActiveMembership(ctx, args.workspaceId);

    const { status } = args;
    const projectsQuery =
      status !== undefined
        ? ctx.db
            .query("projects")
            .withIndex("by_workspace_status", (q) =>
              q.eq("workspaceId", args.workspaceId).eq("status", status),
            )
        : ctx.db
            .query("projects")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    const projects = await projectsQuery.take(1000);

    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const owner = await ctx.db.get(project.ownerId);

        // Get member count
        const members = await ctx.db
          .query("projectMembers")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .take(1000);

        return {
          ...project,
          owner,
          memberCount: members.length,
        };
      })
    );

    return projectsWithDetails;
  },
});

/**
 * Get a single project with full details
 */
export const getProject = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.union(
    v.object({
      ...projectFields,
      owner: v.any(),
      members: v.array(v.any()),
      conversation: v.any(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    // IDOR gate (P0-1): caller must be an active member of the project's workspace.
    await requireActiveMembership(ctx, project.workspaceId);

    const owner = await ctx.db.get(project.ownerId);

    // Get all members
    const projectMembers = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .take(1000);

    const membersWithUsers = await Promise.all(
      projectMembers.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          user,
        };
      })
    );

    // Get conversation if exists
    let conversation = null;
    if (project.conversationId) {
      conversation = await ctx.db.get(project.conversationId);
    }

    return {
      ...project,
      owner,
      members: membersWithUsers,
      conversation,
    };
  },
});

/**
 * Get projects where user is a member
 */
export const getMyProjects = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.array(
    v.union(
      v.object({
        ...projectFields,
        owner: v.any(),
        memberRole: v.union(
          v.literal("owner"),
          v.literal("admin"),
          v.literal("member"),
          v.literal("viewer"),
        ),
      }),
      v.null(),
    ),
  ),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(1000);

    const projects = await Promise.all(
      memberships.map(async (membership) => {
        const project = await ctx.db.get(membership.projectId);
        if (!project || project.workspaceId !== args.workspaceId) return null;

        const owner = await ctx.db.get(project.ownerId);

        return {
          ...project,
          owner,
          memberRole: membership.role,
        };
      })
    );

    return projects.filter(Boolean);
  },
});
