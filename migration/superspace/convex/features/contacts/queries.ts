import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Queries for contacts feature
 */

export const getContacts = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(500)

    return contacts
  },
})

export const getContactById = query({
  args: {
    workspaceId: v.id("workspaces"),
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const contact = await ctx.db.get(args.contactId)
    if (!contact || contact.workspaceId !== args.workspaceId) {
      return null
    }

    return contact
  },
})

export const searchContacts = query({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const searchQuery = args.query.toLowerCase()
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    return contacts.filter(
      (c) =>
        c.firstName?.toLowerCase().includes(searchQuery) ||
        c.lastName?.toLowerCase().includes(searchQuery) ||
        c.email?.toLowerCase().includes(searchQuery) ||
        c.title?.toLowerCase().includes(searchQuery)
    )
  },
})
