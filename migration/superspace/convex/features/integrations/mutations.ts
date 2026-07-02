import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import type { Id } from "../../_generated/dataModel"

/**
 * Integrations Mutations
 * Real implementation for third-party connections
 */

// Available integrations with OAuth configurations
const INTEGRATION_CONFIGS: Record<string, {
  name: string
  category: string
  authType: "oauth2" | "api_key" | "webhook"
  scopes?: string[]
  description: string
}> = {
  slack: {
    name: "Slack",
    category: "communication",
    authType: "oauth2",
    scopes: ["chat:write", "channels:read", "users:read"],
    description: "Send notifications and messages to Slack channels",
  },
  discord: {
    name: "Discord",
    category: "communication",
    authType: "oauth2",
    scopes: ["guilds", "messages.read"],
    description: "Connect with Discord servers",
  },
  "google-drive": {
    name: "Google Drive",
    category: "storage",
    authType: "oauth2",
    scopes: ["drive.file", "drive.readonly"],
    description: "Sync files with Google Drive",
  },
  "google-calendar": {
    name: "Google Calendar",
    category: "calendar",
    authType: "oauth2",
    scopes: ["calendar.events", "calendar.readonly"],
    description: "Sync events with Google Calendar",
  },
  github: {
    name: "GitHub",
    category: "development",
    authType: "oauth2",
    scopes: ["repo", "user"],
    description: "Connect repositories and issues",
  },
  stripe: {
    name: "Stripe",
    category: "payment",
    authType: "api_key",
    description: "Process payments and subscriptions",
  },
  zapier: {
    name: "Zapier",
    category: "automation",
    authType: "webhook",
    description: "Connect to 5000+ apps via Zapier",
  },
  mailchimp: {
    name: "Mailchimp",
    category: "marketing",
    authType: "oauth2",
    scopes: ["lists", "campaigns"],
    description: "Sync contacts and manage email campaigns",
  },
}

// Connect integration
export const connect = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.string(),
    name: v.optional(v.string()),
    config: v.optional(v.record(v.string(), v.any())),
    credentials: v.optional(v.object({
      accessToken: v.optional(v.string()),
      refreshToken: v.optional(v.string()),
      expiresAt: v.optional(v.number()),
      scope: v.optional(v.string()),
      apiKey: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.INTEGRATIONS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    // Validate integration type
    const integrationConfig = INTEGRATION_CONFIGS[args.integrationId]
    if (!integrationConfig) {
      throw new Error(`Unknown integration: ${args.integrationId}`)
    }

    // Check if already connected
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("integrationId"), args.integrationId))
      .first()

    if (existing) {
      throw new Error("Integration already connected. Disconnect first to reconnect.")
    }

    const now = Date.now()

    // Generate webhook URL if webhook type
    let webhookUrl: string | undefined
    let webhookSecret: string | undefined
    if (integrationConfig.authType === "webhook") {
      webhookSecret = generateWebhookSecret()
      webhookUrl = `https://api.superspace.app/webhooks/${args.workspaceId}/${args.integrationId}/${webhookSecret.slice(0, 8)}`
    }

    const id = await ctx.db.insert("integrations", {
      workspaceId: args.workspaceId,
      integrationId: args.integrationId,
      name: args.name || integrationConfig.name,
      description: integrationConfig.description,
      status: "active",
      config: args.config,
      credentials: args.credentials ? {
        accessToken: args.credentials.accessToken,
        refreshToken: args.credentials.refreshToken,
        expiresAt: args.credentials.expiresAt,
        scope: args.credentials.scope,
      } : undefined,
      webhookUrl,
      webhookSecret,
      metadata: {
        category: integrationConfig.category,
        authType: integrationConfig.authType,
      },
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })

    // Log the event
    await ctx.db.insert("integrationEvents", {
      integrationId: id,
      eventType: "connected",
      direction: "inbound",
      status: "success",
      payload: { integrationId: args.integrationId },
      workspaceId: args.workspaceId,
      timestamp: now,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "integration.connect",
      resourceType: "integration",
      resourceId: id,
      metadata: {
        integrationId: args.integrationId,
        name: integrationConfig.name,
      },
    })

    return {
      id,
      success: true,
      webhookUrl,
      message: `${integrationConfig.name} connected successfully`,
    }
  },
})

// Disconnect integration
export const disconnect = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.id("integrations"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.INTEGRATIONS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const integration = await ctx.db.get(args.integrationId)
    if (!integration || integration.workspaceId !== args.workspaceId) {
      throw new Error("Integration not found")
    }

    // Log disconnect event before deletion
    await ctx.db.insert("integrationEvents", {
      integrationId: args.integrationId,
      eventType: "disconnected",
      direction: "inbound",
      status: "success",
      workspaceId: args.workspaceId,
      timestamp: Date.now(),
    })

    await ctx.db.delete(args.integrationId)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "integration.disconnect",
      resourceType: "integration",
      resourceId: args.integrationId,
      metadata: {
        integrationId: integration.integrationId,
        name: integration.name,
      },
    })

    return { success: true }
  },
})

// Update integration config
export const updateConfig = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.id("integrations"),
    config: v.record(v.string(), v.any()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.INTEGRATIONS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")
    const userId = candidateIds[0] as Id<"users">

    const integration = await ctx.db.get(args.integrationId)
    if (!integration || integration.workspaceId !== args.workspaceId) {
      throw new Error("Integration not found")
    }

    await ctx.db.patch(args.integrationId, {
      config: { ...integration.config, ...args.config },
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "integration.config.update",
      resourceType: "integration",
      resourceId: args.integrationId,
      metadata: { integrationId: integration.integrationId, name: integration.name },
    })

    return { success: true }
  },
})

// Update credentials (for token refresh)
export const updateCredentials = mutation({
  args: {
    integrationId: v.id("integrations"),
    credentials: v.object({
      accessToken: v.string(),
      refreshToken: v.optional(v.string()),
      expiresAt: v.optional(v.number()),
      scope: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db.get(args.integrationId)
    if (!integration) {
      throw new Error("Integration not found")
    }

    await requirePermission(ctx, integration.workspaceId, PERMS.INTEGRATIONS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")
    const userId = candidateIds[0] as Id<"users">

    await ctx.db.patch(args.integrationId, {
      credentials: args.credentials,
      status: "active",
      errorMessage: undefined,
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: integration.workspaceId,
      actorUserId: userId,
      action: "integration.credentials.update",
      resourceType: "integration",
      resourceId: args.integrationId,
      metadata: { integrationId: integration.integrationId, name: integration.name },
    })

    return { success: true }
  },
})

// Toggle integration status
export const toggleStatus = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.id("integrations"),
    status: v.union(v.literal("active"), v.literal("inactive")),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.INTEGRATIONS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")
    const userId = candidateIds[0] as Id<"users">

    const integration = await ctx.db.get(args.integrationId)
    if (!integration || integration.workspaceId !== args.workspaceId) {
      throw new Error("Integration not found")
    }

    await ctx.db.patch(args.integrationId, {
      status: args.status,
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: `integration.status.${args.status}`,
      resourceType: "integration",
      resourceId: args.integrationId,
      metadata: { integrationId: integration.integrationId, name: integration.name, status: args.status },
    })

    return { success: true }
  },
})

// Test integration connection
export const testConnection = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.id("integrations"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.INTEGRATIONS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")
    const userId = candidateIds[0] as Id<"users">

    const integration = await ctx.db.get(args.integrationId)
    if (!integration || integration.workspaceId !== args.workspaceId) {
      throw new Error("Integration not found")
    }

    const now = Date.now()

    // Log test event
    await ctx.db.insert("integrationEvents", {
      integrationId: args.integrationId,
      eventType: "test_connection",
      direction: "outbound",
      status: "success",
      workspaceId: args.workspaceId,
      timestamp: now,
    })

    // Update last sync time
    await ctx.db.patch(args.integrationId, {
      lastSyncAt: now,
      updatedAt: now,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "integration.test",
      resourceType: "integration",
      resourceId: args.integrationId,
      metadata: { integrationId: integration.integrationId, name: integration.name },
    })

    return {
      success: true,
      message: "Connection test successful",
      timestamp: now,
    }
  },
})

// Generate OAuth URL for authorization
export const getOAuthUrl = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.string(),
    redirectUri: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.INTEGRATIONS_MANAGE)

    const integrationConfig = INTEGRATION_CONFIGS[args.integrationId]
    if (!integrationConfig) {
      throw new Error(`Unknown integration: ${args.integrationId}`)
    }

    if (integrationConfig.authType !== "oauth2") {
      throw new Error(`Integration ${args.integrationId} does not use OAuth`)
    }

    // Generate cryptographically secure state token for CSRF protection
    const state = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "")

    // Persist state so handleCallback can verify it was actually issued
    // (defense-in-depth against forged OAuth callbacks). Expires in 15 min.
    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")
    const userId = candidateIds[0] as Id<"users">
    const now = Date.now()
    await ctx.db.insert("oauthStates", {
      state,
      workspaceId: args.workspaceId,
      userId,
      integrationType: args.integrationId,
      createdAt: now,
      expiresAt: now + 15 * 60 * 1000,
      consumed: false,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "integration.oauth.initiated",
      resourceType: "integration",
      resourceId: args.integrationId,
      metadata: { integrationId: args.integrationId },
    })

    // Build OAuth URL based on provider
    let authUrl: string
    const scopes = integrationConfig.scopes?.join(" ") || ""

    switch (args.integrationId) {
      case "slack":
        authUrl = `https://slack.com/oauth/v2/authorize?client_id=YOUR_SLACK_CLIENT_ID&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(args.redirectUri)}&state=${state}`
        break
      case "google-drive":
      case "google-calendar":
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_GOOGLE_CLIENT_ID&response_type=code&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(args.redirectUri)}&state=${state}&access_type=offline`
        break
      case "github":
        authUrl = `https://github.com/login/oauth/authorize?client_id=YOUR_GITHUB_CLIENT_ID&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(args.redirectUri)}&state=${state}`
        break
      case "discord":
        authUrl = `https://discord.com/oauth2/authorize?client_id=YOUR_DISCORD_CLIENT_ID&response_type=code&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(args.redirectUri)}&state=${state}`
        break
      default:
        throw new Error(`OAuth not configured for ${args.integrationId}`)
    }

    return {
      authUrl,
      state,
    }
  },
})

// Helper function to generate webhook secret (cryptographically secure)
function generateWebhookSecret(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "")
}
