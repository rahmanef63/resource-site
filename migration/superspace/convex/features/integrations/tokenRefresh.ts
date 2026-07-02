/**
 * OAuth Token Refresh Scheduler
 * Periodically refreshes OAuth tokens that are about to expire
 */

import { v } from "convex/values";
import { anyApi } from "convex/server";
import { internalMutation, internalQuery } from "../../_generated/server";

// Workaround TS2589 (Type instantiation excessively deep) — Convex's deep
// `internal` typegen blows the type budget for this scheduler call. Fall back
// to `anyApi` typed loosely; safe because the target action is stable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiAny: any = anyApi;

/**
 * Find integrations with tokens expiring soon
 */
export const getExpiringTokens = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    // Refresh tokens that expire within the next 30 minutes
    const expiryThreshold = now + 30 * 60 * 1000;

    const integrations = await ctx.db
      .query("integrations")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(2000);

    // Filter to OAuth integrations with expiring tokens
    return integrations.filter((integration) => {
      const credentials = integration.credentials;
      if (!credentials?.expiresAt || !credentials?.refreshToken) {
        return false;
      }
      return credentials.expiresAt < expiryThreshold;
    });
  },
});

/**
 * Process token refresh for a batch of integrations
 */
export const processTokenRefresh = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiryThreshold = now + 30 * 60 * 1000;

    // Get all active integrations with OAuth credentials
    const integrations = await ctx.db
      .query("integrations")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(2000);

    const toRefresh: Array<{
      integrationDbId: any;
      integrationId: string;
      refreshToken: string;
      workspaceId: any;
    }> = [];

    for (const integration of integrations) {
      const credentials = integration.credentials;
      if (!credentials?.expiresAt || !credentials?.refreshToken) {
        continue;
      }

      if (credentials.expiresAt < expiryThreshold) {
        toRefresh.push({
          integrationDbId: integration._id,
          integrationId: integration.integrationId,
          refreshToken: credentials.refreshToken,
          workspaceId: integration.workspaceId,
        });
      }
    }

    console.log(`Found ${toRefresh.length} tokens to refresh`);

    // Schedule refresh actions for each integration
    for (const item of toRefresh) {
      await ctx.scheduler.runAfter(0, apiAny.features.integrations.oauthTokenExchange.refreshAccessToken, {
        integrationDbId: item.integrationDbId,
        integrationId: item.integrationId,
        refreshToken: item.refreshToken,
      });

      // Log the refresh attempt
      await ctx.db.insert("integrationEvents", {
        integrationId: item.integrationDbId,
        eventType: "token_refresh",
        direction: "outbound",
        status: "pending",
        payload: {},
        workspaceId: item.workspaceId,
        timestamp: now,
      });
    }

    return { scheduled: toRefresh.length };
  },
});

/**
 * Mark integration as needing re-authentication
 * Called when refresh token is invalid
 */
export const markNeedsReauth = internalMutation({
  args: {
    integrationDbId: v.id("integrations"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.integrationDbId, {
      status: "error",
      errorMessage: "OAuth token expired - please reconnect",
      updatedAt: now,
    });

    const integration = await ctx.db.get(args.integrationDbId);
    if (integration) {
      await ctx.db.insert("integrationEvents", {
        integrationId: args.integrationDbId,
        eventType: "reauth_required",
        direction: "outbound",
        status: "failed",
        errorMessage: "Refresh token invalid or expired",
        payload: {},
        workspaceId: integration.workspaceId,
        timestamp: now,
      });
    }
  },
});
