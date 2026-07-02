import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { PERMS } from "../../workspace/permissions";
import { logAuditEvent } from "../../shared/audit";


/**
 * Create a new CRM customer
 */
export const createCustomer = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("lead"),
      v.literal("prospect"),
      v.literal("customer"),
      v.literal("inactive"),
    )),
    assignedTo: v.optional(v.id("users")),
    tags: v.optional(v.array(v.string())),
    createConversation: v.optional(v.boolean()),
  },
  returns: v.id("crmCustomers"),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.CRM_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if customer with this email already exists
    const existing = await (ctx.db
      .query("crmCustomers")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .first());

    if (existing) {
      throw new Error("Customer with this email already exists");
    }

    let conversationId = undefined;

    // Create conversation if requested
    if (args.createConversation) {
      conversationId = await ctx.db.insert("conversations", {
        name: `${args.name} - Customer Chat`,
        type: "group",
        workspaceId: args.workspaceId,
        createdBy: userId,
        isActive: true,
        metadata: {
          description: `CRM conversation with ${args.name}`,
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

    // Create customer
    const customerId = await ctx.db.insert("crmCustomers", {
      workspaceId: args.workspaceId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      company: args.company,
      status: args.status || "lead",
      conversationId,
      assignedTo: args.assignedTo,
      tags: args.tags,
      createdBy: userId,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "crm_customer.create",
      resourceType: "crmCustomer",
      resourceId: customerId,
      metadata: {
        email: args.email,
        company: args.company,
        status: args.status,
      },
    });

    return customerId;
  },
});

/**
 * Update customer
 */
export const updateCustomer = mutation({
  args: {
    customerId: v.id("crmCustomers"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("lead"),
      v.literal("prospect"),
      v.literal("customer"),
      v.literal("inactive"),
    )),
    assignedTo: v.optional(v.id("users")),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.object({
      source: v.optional(v.string()),
      industry: v.optional(v.string()),
      website: v.optional(v.string()),
      address: v.optional(v.string()),
      notes: v.optional(v.string()),
      customFields: v.optional(v.record(v.string(), v.any())),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) throw new Error("Customer not found");
    await requirePermission(ctx, customer.workspaceId, PERMS.CRM_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.email !== undefined) updates.email = args.email;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.company !== undefined) updates.company = args.company;
    if (args.status !== undefined) updates.status = args.status;
    if (args.assignedTo !== undefined) updates.assignedTo = args.assignedTo;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.metadata !== undefined) {
      updates.metadata = {
        ...customer.metadata,
        ...args.metadata,
      };
    }

    await ctx.db.patch(args.customerId, updates);

    // If assignee changed, add them to conversation
    if (args.assignedTo && customer.conversationId) {
      const existingParticipant = await (ctx.db
        .query("conversationParticipants")
        .withIndex("by_user_conversation", (q: any) =>
          q.eq("userId", args.assignedTo!)
        )
        .filter((q) => q.eq(q.field("conversationId"), customer.conversationId!))
        .first());

      if (!existingParticipant) {
        await ctx.db.insert("conversationParticipants", {
          conversationId: customer.conversationId,
          userId: args.assignedTo,
          role: "admin",
          joinedAt: Date.now(),
          isActive: true,
        });
      }
    }

    await logAuditEvent(ctx, {
      workspaceId: customer.workspaceId,
      actorUserId: userId,
      action: "crm_customer.update",
      resourceType: "crmCustomer",
      resourceId: args.customerId,
      changes: updates,
    });

    return null;
  },
});

/**
 * Delete customer
 */
export const deleteCustomer = mutation({
  args: {
    customerId: v.id("crmCustomers"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) throw new Error("Customer not found");
    await requirePermission(ctx, customer.workspaceId, PERMS.CRM_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");


    // Note: We don't delete the conversation, just mark it as inactive
    if (customer.conversationId) {
      await ctx.db.patch(customer.conversationId, {
        isActive: false,
      });
    }

    await ctx.db.delete(args.customerId);

    await logAuditEvent(ctx, {
      workspaceId: customer.workspaceId,
      actorUserId: userId,
      action: "crm_customer.delete",
      resourceType: "crmCustomer",
      resourceId: args.customerId,
      metadata: { name: customer.name, email: customer.email },
    });

    return null;
  },
});
