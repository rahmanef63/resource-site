import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { PERMS } from "../../workspace/permissions";
import { logAuditEvent } from "../../shared/audit";


/**
 * Create a new project
 */
export const createProject = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
    )),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    createConversation: v.optional(v.boolean()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.PROJECTS_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");


    let conversationId = undefined;

    // Create conversation if requested
    if (args.createConversation) {
      conversationId = await ctx.db.insert("conversations", {
        name: `${args.name} - Discussion`,
        type: "group",
        workspaceId: args.workspaceId,
        createdBy: userId,
        isActive: true,
        metadata: {
          description: `Project discussion for ${args.name}`,
        },
      });

      // Add creator to conversation
      await ctx.db.insert("conversationParticipants", {
        conversationId,
        userId,
        role: "admin",
        joinedAt: Date.now(),
        isActive: true,
      });
    }

    // Create project
    const projectId = await ctx.db.insert("projects", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      status: "planning",
      priority: args.priority,
      startDate: args.startDate,
      endDate: args.endDate,
      conversationId,
      createdBy: userId,
      ownerId: userId,
    });

    // Add creator as owner member
    await ctx.db.insert("projectMembers", {
      projectId,
      userId,
      role: "owner",
      joinedAt: Date.now(),
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "project.create",
      resourceType: "project",
      resourceId: projectId,
      metadata: { name: args.name },
    });

    return projectId;
  },
});

/**
 * Update project
 */
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("planning"),
      v.literal("active"),
      v.literal("on_hold"),
      v.literal("completed"),
      v.literal("archived"),
    )),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
    )),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    await requirePermission(ctx, project.workspaceId, PERMS.PROJECTS_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user has permission (owner or admin)
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", userId)
      )
      .first();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("Not authorized");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status !== undefined) updates.status = args.status;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;

    await ctx.db.patch(args.projectId, updates);

    await logAuditEvent(ctx, {
      workspaceId: project.workspaceId,
      actorUserId: userId,
      action: "project.update",
      resourceType: "project",
      resourceId: args.projectId,
      changes: updates,
    });

    return null;
  },
});

/**
 * Add member to project
 */
export const addProjectMember = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
    role: v.optional(v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer"),
    )),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    await requirePermission(ctx, project.workspaceId, PERMS.PROJECTS_MANAGE);
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Check if current user is owner or admin
    const currentMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", currentUserId)
      )
      .first();

    if (!currentMembership || (currentMembership.role !== "owner" && currentMembership.role !== "admin")) {
      throw new Error("Not authorized");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.userId)
      )
      .first();

    if (existingMembership) {
      throw new Error("User is already a member");
    }

    // Add member
    await ctx.db.insert("projectMembers", {
      projectId: args.projectId,
      userId: args.userId,
      role: args.role || "member",
      joinedAt: Date.now(),
    });

    // Add to conversation if exists
    if (project.conversationId) {
      const existingParticipant = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_user_conversation", (q) =>
          q.eq("userId", args.userId).eq("conversationId", project.conversationId!)
        )
        .first();

      if (!existingParticipant) {
        await ctx.db.insert("conversationParticipants", {
          conversationId: project.conversationId,
          userId: args.userId,
          role: "member",
          joinedAt: Date.now(),
          isActive: true,
        });
      }
    }

    await logAuditEvent(ctx, {
      workspaceId: project.workspaceId,
      actorUserId: currentUserId,
      action: "project.add_member",
      resourceType: "project",
      resourceId: args.projectId,
      metadata: { addedUserId: args.userId, role: args.role },
    });

    return null;
  },
});

/**
 * Remove member from project
 */
export const removeProjectMember = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    await requirePermission(ctx, project.workspaceId, PERMS.PROJECTS_MANAGE);
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");


    // Check if current user is owner or admin or removing themselves
    const currentMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", currentUserId)
      )
      .first();

    if (!currentMembership) throw new Error("Not authorized");

    if (args.userId !== currentUserId && currentMembership.role !== "owner" && currentMembership.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Cannot remove owner
    const targetMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.userId)
      )
      .first();

    if (!targetMembership) throw new Error("User is not a member");

    if (targetMembership.role === "owner") {
      throw new Error("Cannot remove project owner");
    }

    // Remove member
    await ctx.db.delete(targetMembership._id);

    await logAuditEvent(ctx, {
      workspaceId: project.workspaceId,
      actorUserId: currentUserId,
      action: "project.remove_member",
      resourceType: "project",
      resourceId: args.projectId,
      metadata: { removedUserId: args.userId },
    });

    return null;
  },
});

/**
 * Archive project — sets status to "archived" so it disappears from active
 * lists but remains restorable. Soft alternative to deleteProject.
 */
export const archiveProject = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.PROJECTS_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.workspaceId !== args.workspaceId) {
      throw new Error("Project not found");
    }
    if (project.status === "archived") return null;

    await ctx.db.patch(args.projectId, { status: "archived" });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "project.archived",
      resourceType: "project",
      resourceId: args.projectId,
      metadata: { name: project.name, previousStatus: project.status },
    });

    return null;
  },
});

/**
 * Hard-delete a project. Cascades all `projectMembers` rows. Caller must pass
 * confirm:true. Shared `tasks` table has no projectId column so no task
 * cascade is run here.
 */
export const deleteProject = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    confirm: v.literal(true),
  },
  returns: v.object({ membersDeleted: v.number() }),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.PROJECTS_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.workspaceId !== args.workspaceId) {
      throw new Error("Project not found");
    }

    const callerMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", userId),
      )
      .first();
    if (!callerMembership || callerMembership.role !== "owner") {
      throw new Error("Only the project owner can delete this project");
    }

    const members = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .take(1000);
    await Promise.all(members.map((m) => ctx.db.delete(m._id)));

    await ctx.db.delete(args.projectId);

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "project.deleted",
      resourceType: "project",
      resourceId: args.projectId,
      metadata: { name: project.name, membersDeleted: members.length },
    });

    return { membersDeleted: members.length };
  },
});
