/**
 * OAuth Callback Handler
 * Processes OAuth authorization code exchange
 */

import { ConvexError, v } from "convex/values";
import { internalMutation } from "../../_generated/server";

/**
 * Handle OAuth callback after user authorizes.
 *
 * Verifies the `state` token was previously issued by getOAuthUrl, has not
 * been consumed, has not expired (15 min TTL), and matches the workspace +
 * integration type. This blocks forged OAuth callbacks that could otherwise
 * bind an attacker-controlled third-party account to a victim workspace.
 */
export const handleCallback = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.string(),
    code: v.string(),
    state: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // ----- OAuth state verification (CSRF defense) -----
    const stateRow = await ctx.db
      .query("oauthStates")
      .withIndex("by_state", (q) => q.eq("state", args.state))
      .first();
    if (!stateRow) {
      throw new ConvexError("Invalid OAuth state");
    }
    if (stateRow.consumed) {
      throw new ConvexError("Invalid OAuth state");
    }
    if (stateRow.expiresAt < now) {
      throw new ConvexError("Invalid OAuth state");
    }
    if (stateRow.workspaceId !== args.workspaceId) {
      throw new ConvexError("Invalid OAuth state");
    }
    if (stateRow.integrationType !== args.integrationId) {
      throw new ConvexError("Invalid OAuth state");
    }
    // Mark consumed — single-use, prevents replay
    await ctx.db.patch(stateRow._id, { consumed: true });

    // Find or create the integration record
    let integration = await ctx.db
      .query("integrations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("integrationId"), args.integrationId))
      .first();

    if (!integration) {
      // Create a pending integration record
      // The actual token exchange will happen via an action
      const id = await ctx.db.insert("integrations", {
        workspaceId: args.workspaceId,
        integrationId: args.integrationId,
        name: getIntegrationName(args.integrationId),
        status: "inactive", // Will be activated after token exchange
        metadata: {
          oauthCode: args.code,
          oauthState: args.state,
          pendingTokenExchange: true,
        },
        createdBy: "system" as any, // Will be updated when user claims
        createdAt: now,
        updatedAt: now,
      });

      // Log the event
      await ctx.db.insert("integrationEvents", {
        integrationId: id,
        eventType: "oauth_callback_received",
        direction: "inbound",
        status: "pending",
        payload: { integrationId: args.integrationId, hasCode: true },
        workspaceId: args.workspaceId,
        timestamp: now,
      });

      return { success: true, integrationId: id, pendingTokenExchange: true };
    }

    // Update existing integration with the new OAuth code
    await ctx.db.patch(integration._id, {
      metadata: {
        ...integration.metadata,
        oauthCode: args.code,
        oauthState: args.state,
        pendingTokenExchange: true,
      },
      updatedAt: now,
    });

    // Log the event
    await ctx.db.insert("integrationEvents", {
      integrationId: integration._id,
      eventType: "oauth_callback_received",
      direction: "inbound",
      status: "pending",
      payload: { integrationId: args.integrationId, hasCode: true },
      workspaceId: args.workspaceId,
      timestamp: now,
    });

    return { success: true, integrationId: integration._id, pendingTokenExchange: true };
  },
});

/**
 * Store OAuth tokens after exchange
 */
export const storeTokens = internalMutation({
  args: {
    integrationId: v.id("integrations"),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    tokenType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db.get(args.integrationId);
    if (!integration) {
      throw new Error("Integration not found");
    }

    const now = Date.now();

    await ctx.db.patch(args.integrationId, {
      credentials: {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiresAt: args.expiresAt,
        scope: args.scope,
      },
      status: "active",
      metadata: {
        ...integration.metadata,
        pendingTokenExchange: false,
        tokenType: args.tokenType,
        lastTokenRefresh: now,
      },
      errorMessage: undefined,
      updatedAt: now,
    });

    // Log success
    await ctx.db.insert("integrationEvents", {
      integrationId: args.integrationId,
      eventType: "oauth_tokens_stored",
      direction: "inbound",
      status: "success",
      workspaceId: integration.workspaceId,
      timestamp: now,
    });

    return { success: true };
  },
});

/**
 * Mark OAuth as failed
 */
export const markOAuthFailed = internalMutation({
  args: {
    integrationId: v.id("integrations"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db.get(args.integrationId);
    if (!integration) {
      throw new Error("Integration not found");
    }

    const now = Date.now();

    await ctx.db.patch(args.integrationId, {
      status: "error",
      errorMessage: args.error,
      metadata: {
        ...integration.metadata,
        pendingTokenExchange: false,
      },
      updatedAt: now,
    });

    // Log failure
    await ctx.db.insert("integrationEvents", {
      integrationId: args.integrationId,
      eventType: "oauth_token_exchange_failed",
      direction: "inbound",
      status: "failed",
      errorMessage: args.error,
      workspaceId: integration.workspaceId,
      timestamp: now,
    });

    return { success: false, error: args.error };
  },
});

// =============================================================================
// Helper Functions
// =============================================================================

function getIntegrationName(integrationId: string): string {
  const names: Record<string, string> = {
    slack: "Slack",
    discord: "Discord",
    "google-drive": "Google Drive",
    "google-calendar": "Google Calendar",
    github: "GitHub",
    stripe: "Stripe",
    zapier: "Zapier",
    mailchimp: "Mailchimp",
  };
  return names[integrationId] || integrationId;
}
