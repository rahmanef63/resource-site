import { v } from "convex/values";
import { query } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";
import { ensureUser, requireActiveMembership } from "../../auth/helpers";

// ---------------------------------------------------------------------------
// Return validators (concrete — replaces v.any()). Each mirrors the schema
// definition for the table it represents (convex/features/crm/api/schema.ts +
// convex/features/chat/api/schema.ts + extendedAuthTables.users in
// convex/schema.ts) plus the system fields `_id` / `_creationTime`. Keep in
// sync if those schemas change.
// ---------------------------------------------------------------------------

const userDocValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  name: v.optional(v.string()),
  metadata: v.optional(v.record(v.string(), v.any())),
  avatarUrl: v.optional(v.string()),
  image: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),
  email: v.string(),
  status: v.optional(
    v.union(v.literal("active"), v.literal("inactive"), v.literal("blocked")),
  ),
  clerkId: v.optional(v.string()),
  googleSub: v.optional(v.string()),
  migratedAt: v.optional(v.number()),
  workspaceId: v.optional(v.id("workspaces")),
});

const customerDocFields = {
  _id: v.id("crmCustomers"),
  _creationTime: v.number(),
  workspaceId: v.id("workspaces"),
  userId: v.optional(v.id("users")),
  name: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  company: v.optional(v.string()),
  status: v.union(
    v.literal("lead"),
    v.literal("prospect"),
    v.literal("customer"),
    v.literal("inactive"),
  ),
  conversationId: v.optional(v.id("conversations")),
  assignedTo: v.optional(v.id("users")),
  tags: v.optional(v.array(v.string())),
  metadata: v.optional(
    v.object({
      source: v.optional(v.string()),
      industry: v.optional(v.string()),
      website: v.optional(v.string()),
      address: v.optional(v.string()),
      notes: v.optional(v.string()),
      customFields: v.optional(v.record(v.string(), v.any())),
    }),
  ),
  createdBy: v.id("users"),
};

const conversationDocValidator = v.object({
  _id: v.id("conversations"),
  _creationTime: v.number(),
  name: v.optional(v.string()),
  type: v.union(v.literal("personal"), v.literal("group"), v.literal("ai")),
  workspaceId: v.optional(v.id("workspaces")),
  createdBy: v.id("users"),
  isActive: v.boolean(),
  lastMessageAt: v.optional(v.number()),
  metadata: v.optional(
    v.object({
      description: v.optional(v.string()),
      avatar: v.optional(v.string()),
      aiModel: v.optional(v.string()),
      systemPrompt: v.optional(v.string()),
      isFavorite: v.optional(v.boolean()),
      isPinned: v.optional(v.boolean()),
      isMuted: v.optional(v.boolean()),
      isDraft: v.optional(v.boolean()),
      isArchived: v.optional(v.boolean()),
      archivedAt: v.optional(v.number()),
      archivedBy: v.optional(v.id("users")),
      labels: v.optional(v.array(v.string())),
    }),
  ),
});

const messageWithAuthorValidator = v.object({
  _id: v.id("messages"),
  _creationTime: v.number(),
  conversationId: v.id("conversations"),
  senderId: v.id("users"),
  content: v.string(),
  type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
  replyToId: v.optional(v.id("messages")),
  editedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
  metadata: v.optional(
    v.object({
      fileName: v.optional(v.string()),
      fileSize: v.optional(v.number()),
      mimeType: v.optional(v.string()),
      storageId: v.optional(v.id("_storage")),
      storageIds: v.optional(v.array(v.string())),
      fileNames: v.optional(v.array(v.string())),
      fileSizes: v.optional(v.array(v.number())),
      mimeTypes: v.optional(v.array(v.string())),
      aiModel: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      mentions: v.optional(v.array(v.string())),
    }),
  ),
  author: v.union(userDocValidator, v.null()),
});

const customerWithJoinsValidator = v.object({
  ...customerDocFields,
  assignee: v.union(userDocValidator, v.null()),
  user: v.union(userDocValidator, v.null()),
});

/**
 * Get all customers in a workspace
 */
export const getWorkspaceCustomers = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.union(
      v.literal("lead"),
      v.literal("prospect"),
      v.literal("customer"),
      v.literal("inactive"),
    )),
  },
  returns: v.array(customerWithJoinsValidator),
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const { status } = args;
    const customersQuery =
      status !== undefined
        ? ctx.db
            .query("crmCustomers")
            .withIndex("by_status", (q) => q.eq("status", status))
            .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
        : ctx.db
            .query("crmCustomers")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    const customers = await customersQuery.take(500);

    const customersWithDetails = await Promise.all(
      customers.map(async (customer) => {
        const assignee = customer.assignedTo ? await ctx.db.get(customer.assignedTo) : null;
        const user = customer.userId ? await ctx.db.get(customer.userId) : null;

        return {
          ...customer,
          assignee,
          user,
        };
      })
    );

    return customersWithDetails;
  },
});

/**
 * Get a single customer with full details
 */
export const getCustomer = query({
  args: {
    workspaceId: v.id("workspaces"),
    customerId: v.id("crmCustomers"),
  },
  returns: v.union(
    v.object({
      ...customerDocFields,
      assignee: v.union(userDocValidator, v.null()),
      user: v.union(userDocValidator, v.null()),
      conversation: v.union(conversationDocValidator, v.null()),
      messages: v.array(messageWithAuthorValidator),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const customer = await ctx.db.get(args.customerId);
    if (!customer) return null;
    // Workspace isolation: a customer fetched by id MUST belong to the
    // workspace the caller has been authorized against. Otherwise any member
    // of workspace A could read workspace B's customer PII + messages.
    if (customer.workspaceId !== args.workspaceId) {
      throw new Error("Not authorized");
    }

    const assignee = customer.assignedTo ? await ctx.db.get(customer.assignedTo) : null;
    const user = customer.userId ? await ctx.db.get(customer.userId) : null;

    // Get conversation if exists
    let conversation: Doc<"conversations"> | null = null;
    let messages: Array<Doc<"messages"> & { author: Doc<"users"> | null }> = [];

    const conversationId = customer.conversationId;

    if (conversationId) {
      conversation = await ctx.db.get(conversationId);

      if (conversation) {
        const conversationMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .order("desc")
          .take(50);

        messages = await Promise.all(
          conversationMessages.map(async (msg) => {
            const author = msg.senderId ? await ctx.db.get(msg.senderId) : null;
            return {
              ...msg,
              author,
            };
          })
        );
      }
    }

    return {
      ...customer,
      assignee,
      user,
      conversation,
      messages: messages.reverse(),
    };
  },
});

/**
 * Get customers assigned to current user
 */
export const getMyCustomers = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.array(v.object(customerDocFields)),
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    const userId = await ensureUser(ctx);

    const customers = await ctx.db
      .query("crmCustomers")
      .withIndex("by_assigned", (q) => q.eq("assignedTo", userId))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .take(200);

    return customers;
  },
});

/**
 * Search customers
 */
export const searchCustomers = query({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
  },
  returns: v.array(v.object(customerDocFields)),
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const customers = await ctx.db
      .query("crmCustomers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(500);

    const searchLower = args.query.toLowerCase();
    const filtered = customers.filter(c =>
      c.name.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      (c.company && c.company.toLowerCase().includes(searchLower))
    );

    return filtered;
  },
});
