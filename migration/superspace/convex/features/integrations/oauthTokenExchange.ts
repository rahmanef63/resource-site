/**
 * OAuth Token Exchange
 * HTTP actions for exchanging OAuth codes for tokens and refreshing tokens
 */

import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";

/**
 * Exchange OAuth authorization code for tokens
 */
export const exchangeCodeForTokens = internalAction({
  args: {
    integrationDbId: v.id("integrations"),
    code: v.string(),
    integrationId: v.string(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const tokenEndpoint = getTokenEndpoint(args.integrationId);
    const clientCredentials = getClientCredentials(args.integrationId);
    const redirectUri = getRedirectUri();

    if (!tokenEndpoint || !clientCredentials) {
      await ctx.runMutation(internal.features.integrations.oauthCallback.markOAuthFailed, {
        integrationId: args.integrationDbId,
        error: `Unsupported integration: ${args.integrationId}`,
      });
      return { success: false, error: "Unsupported integration" };
    }

    try {
      const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: args.code,
          redirect_uri: redirectUri,
          client_id: clientCredentials.clientId,
          client_secret: clientCredentials.clientSecret,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Token exchange failed: ${response.status} - ${errorText}`);
        await ctx.runMutation(internal.features.integrations.oauthCallback.markOAuthFailed, {
          integrationId: args.integrationDbId,
          error: `Token exchange failed: ${response.status}`,
        });
        return { success: false, error: `Token exchange failed: ${response.status}` };
      }

      const tokens = await response.json();

      // Store tokens
      await ctx.runMutation(internal.features.integrations.oauthCallback.storeTokens, {
        integrationId: args.integrationDbId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
        tokenType: tokens.token_type || "Bearer",
        scope: tokens.scope,
      });

      return { success: true };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Token exchange error:", error);
      await ctx.runMutation(internal.features.integrations.oauthCallback.markOAuthFailed, {
        integrationId: args.integrationDbId,
        error: msg || "Unknown error during token exchange",
      });
      return { success: false, error: msg };
    }
  },
});

/**
 * Refresh an OAuth access token
 */
export const refreshAccessToken = internalAction({
  args: {
    integrationDbId: v.id("integrations"),
    integrationId: v.string(),
    refreshToken: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenEndpoint = getTokenEndpoint(args.integrationId);
    const clientCredentials = getClientCredentials(args.integrationId);

    if (!tokenEndpoint || !clientCredentials) {
      return { success: false, error: "Unsupported integration" };
    }

    try {
      const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: args.refreshToken,
          client_id: clientCredentials.clientId,
          client_secret: clientCredentials.clientSecret,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Token refresh failed: ${response.status} - ${errorText}`);
        return { success: false, error: `Token refresh failed: ${response.status}` };
      }

      const tokens = await response.json();

      // Update tokens
      await ctx.runMutation(internal.features.integrations.oauthCallback.storeTokens, {
        integrationId: args.integrationDbId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || args.refreshToken, // Some providers don't return new refresh token
        expiresAt: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
        tokenType: tokens.token_type || "Bearer",
        scope: tokens.scope,
      });

      return { success: true };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Token refresh error:", error);
      return { success: false, error: msg };
    }
  },
});

/**
 * Get token endpoint for OAuth provider
 */
function getTokenEndpoint(integrationId: string): string | null {
  const endpoints: Record<string, string> = {
    slack: "https://slack.com/api/oauth.v2.access",
    google: "https://oauth2.googleapis.com/token",
    github: "https://github.com/login/oauth/access_token",
    discord: "https://discord.com/api/oauth2/token",
    microsoft: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    notion: "https://api.notion.com/v1/oauth/token",
    linear: "https://api.linear.app/oauth/token",
    figma: "https://www.figma.com/api/oauth/token",
  };
  return endpoints[integrationId] || null;
}

/**
 * Get client credentials from environment variables
 */
function getClientCredentials(
  integrationId: string
): { clientId: string; clientSecret: string } | null {
  // Environment variable naming convention: INTEGRATION_CLIENT_ID, INTEGRATION_CLIENT_SECRET
  const prefix = integrationId.toUpperCase();
  const clientId = process.env[`${prefix}_CLIENT_ID`];
  const clientSecret = process.env[`${prefix}_CLIENT_SECRET`];

  if (!clientId || !clientSecret) {
    console.warn(`Missing OAuth credentials for ${integrationId}`);
    return null;
  }

  return { clientId, clientSecret };
}

/**
 * Get OAuth redirect URI
 */
function getRedirectUri(): string {
  // Use CONVEX_SITE_URL for the callback
  const baseUrl = process.env.CONVEX_SITE_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  return `${baseUrl}/oauth/callback`;
}
