import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Integrations Queries
 * Real implementation for third-party connections
 */

// Get all connected integrations for a workspace
export const getIntegrations = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const integrations = await ctx.db
      .query("integrations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    return integrations.map((i) => ({
      _id: i._id,
      integrationId: i.integrationId,
      name: i.name,
      description: i.description,
      status: i.status,
      category: i.metadata?.category,
      authType: i.metadata?.authType,
      webhookUrl: i.webhookUrl,
      lastSyncAt: i.lastSyncAt,
      errorMessage: i.errorMessage,
      createdAt: i.createdAt,
      // Don't expose credentials
    }))
  },
})

// Get single integration details
export const getIntegration = query({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.id("integrations"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const integration = await ctx.db.get(args.integrationId)
    if (!integration || integration.workspaceId !== args.workspaceId) {
      return null
    }

    // Get recent events
    const events = await ctx.db
      .query("integrationEvents")
      .withIndex("by_integration", (q) => q.eq("integrationId", args.integrationId))
      .order("desc")
      .take(20)

    return {
      ...integration,
      credentials: undefined, // Don't expose credentials
      recentEvents: events,
    }
  },
})

// Get available integrations (catalog)
export const getAvailableIntegrations = query({
  args: {},
  handler: async () => {
    return [
      {
        id: "slack",
        name: "Slack",
        category: "communication",
        authType: "oauth2",
        description: "Send notifications and messages to Slack channels",
        icon: "slack",
        features: ["Send messages", "Create channels", "Get notifications"],
      },
      {
        id: "discord",
        name: "Discord",
        category: "communication",
        authType: "oauth2",
        description: "Connect with Discord servers",
        icon: "discord",
        features: ["Send messages", "Bot integration"],
      },
      {
        id: "google-drive",
        name: "Google Drive",
        category: "storage",
        authType: "oauth2",
        description: "Sync files with Google Drive",
        icon: "google-drive",
        features: ["Upload files", "Sync folders", "Share documents"],
      },
      {
        id: "google-calendar",
        name: "Google Calendar",
        category: "calendar",
        authType: "oauth2",
        description: "Sync events with Google Calendar",
        icon: "google-calendar",
        features: ["Sync events", "Create meetings", "Get reminders"],
      },
      {
        id: "github",
        name: "GitHub",
        category: "development",
        authType: "oauth2",
        description: "Connect repositories and issues",
        icon: "github",
        features: ["Link issues", "Track commits", "Deploy hooks"],
      },
      {
        id: "stripe",
        name: "Stripe",
        category: "payment",
        authType: "api_key",
        description: "Process payments and subscriptions",
        icon: "stripe",
        features: ["Process payments", "Manage subscriptions", "View invoices"],
      },
      {
        id: "zapier",
        name: "Zapier",
        category: "automation",
        authType: "webhook",
        description: "Connect to 5000+ apps via Zapier",
        icon: "zapier",
        features: ["Trigger zaps", "Send data", "Receive webhooks"],
      },
      {
        id: "mailchimp",
        name: "Mailchimp",
        category: "marketing",
        authType: "oauth2",
        description: "Sync contacts and manage email campaigns",
        icon: "mailchimp",
        features: ["Sync contacts", "Create campaigns", "Track opens"],
      },
      {
        id: "hubspot",
        name: "HubSpot",
        category: "crm",
        authType: "oauth2",
        description: "Sync contacts and deals with HubSpot CRM",
        icon: "hubspot",
        features: ["Sync contacts", "Sync deals", "Track activities"],
      },
      {
        id: "salesforce",
        name: "Salesforce",
        category: "crm",
        authType: "oauth2",
        description: "Enterprise CRM integration",
        icon: "salesforce",
        features: ["Sync leads", "Sync opportunities", "Track activities"],
      },
    ]
  },
})

// Get integration events history
export const getEvents = query({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.optional(v.id("integrations")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let events
    if (args.integrationId) {
      const integrationId = args.integrationId;
      events = await ctx.db
        .query("integrationEvents")
        .withIndex("by_integration", (q) => q.eq("integrationId", integrationId))
        .order("desc")
        .take(args.limit || 50)
    } else {
      events = await ctx.db
        .query("integrationEvents")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .order("desc")
        .take(args.limit || 50)
    }

    return events
  },
})

// Get integration stats
export const getStats = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const integrations = await ctx.db
      .query("integrations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    const active = integrations.filter((i) => i.status === "active").length
    const inactive = integrations.filter((i) => i.status === "inactive").length
    const error = integrations.filter((i) => i.status === "error").length

    // Get recent events count
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    const recentEvents = await ctx.db
      .query("integrationEvents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.gte(q.field("timestamp"), oneDayAgo))
      .take(1000)

    const successEvents = recentEvents.filter((e) => e.status === "success").length
    const failedEvents = recentEvents.filter((e) => e.status === "failed").length

    return {
      totalIntegrations: integrations.length,
      active,
      inactive,
      error,
      eventsLast24h: recentEvents.length,
      successEventsLast24h: successEvents,
      failedEventsLast24h: failedEvents,
    }
  },
})
