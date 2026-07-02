import { defineTable } from "convex/server"
import { v } from "convex/values"

export const contactsTables = {
  contacts: defineTable({
    workspaceId: v.id("workspaces"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    title: v.optional(v.string()),
    tags: v.array(v.string()),
    notes: v.optional(v.string()),
    owner: v.id("users"),
    isActive: v.boolean(),
    isOptOut: v.boolean(),
    isDoNotCall: v.boolean(),
    isKeyContact: v.boolean(),
    contactType: v.string(),
    preferredContact: v.string(),
    emailConsent: v.boolean(),
    smsConsent: v.boolean(),
    marketingConsent: v.boolean(),
    leadScore: v.number(),
    engagementScore: v.number(),
    relatedContacts: v.array(v.any()),
    customFields: v.array(v.any()),
    address: v.object({
      line1: v.string(),
      city: v.string(),
      country: v.string(),
      postalCode: v.string(),
    }),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_email", ["workspaceId", "email"])
    .searchIndex("search_contacts_email", {
      searchField: "email",
      filterFields: ["workspaceId"],
    })
    .searchIndex("search_contacts_first", {
      searchField: "firstName",
      filterFields: ["workspaceId"],
    }),
}
