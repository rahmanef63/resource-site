/**
 * CMS Lite Website Settings Queries
 * 
 * Read-only operations for website settings.
 */

import { query } from "../../../../_generated/server";
import type { QueryCtx } from "../../../../_generated/server";
import { v } from "convex/values";

/**
 * Get website settings for a workspace
 * Returns null if no settings exist yet
 */
export const getWebsiteSettings = query({
  args: { 
    workspaceId: v.id("workspaces") 
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();
    
    return settings;
  },
});

/**
 * Get website settings by subdomain
 * Used for public website resolution
 */
export const getWebsiteSettingsBySubdomain = query({
  args: { 
    subdomain: v.string() 
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
      .first();
    
    return settings;
  },
});

/**
 * Get website settings by custom domain
 * Used for custom domain resolution
 */
export const getWebsiteSettingsByCustomDomain = query({
  args: { 
    customDomain: v.string() 
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_custom_domain", (q) => q.eq("customDomain", args.customDomain))
      .first();
    
    return settings;
  },
});

/**
 * Check if a subdomain is available
 */
export const isSubdomainAvailable = query({
  args: { 
    subdomain: v.string(),
    excludeWorkspaceId: v.optional(v.id("workspaces")) 
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
      .first();
    
    // Available if doesn't exist, or if it belongs to the excluded workspace
    if (!existing) return true;
    if (args.excludeWorkspaceId && existing.workspaceId === args.excludeWorkspaceId) {
      return true;
    }
    
    return false;
  },
});

/**
 * Check if a custom domain is available
 */
export const isCustomDomainAvailable = query({
  args: {
    customDomain: v.string(),
    excludeWorkspaceId: v.optional(v.id("workspaces"))
  },
  handler: async (ctx: QueryCtx, args) => {
    const existing = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_custom_domain", (q) => q.eq("customDomain", args.customDomain))
      .first();

    // Available if doesn't exist, or if it belongs to the excluded workspace
    if (!existing) return true;
    if (args.excludeWorkspaceId && existing.workspaceId === args.excludeWorkspaceId) {
      return true;
    }

    return false;
  },
});

/**
 * Resolve a workspace from a public host (storefront routing).
 *
 * Matches on `customDomain === host` first, then falls back to
 * `subdomain === host.split('.')[0]`. No auth required — public endpoint
 * used by unauthenticated storefront pages to discover the backing workspace.
 *
 * Returns `{ workspaceId, settings } | null`.
 */
export const getWorkspaceByHost = query({
  args: {
    host: v.string(),
  },
  handler: async (ctx: QueryCtx, args) => {
    const rawHost = (args.host ?? "").trim().toLowerCase();
    if (!rawHost) return null;

    // Strip port if present ("example.com:3000" -> "example.com")
    const host = rawHost.split(":")[0];

    // 1) Exact custom-domain match
    const byCustom = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_custom_domain", (q) => q.eq("customDomain", host))
      .first();

    if (byCustom) {
      return { workspaceId: byCustom.workspaceId, settings: byCustom };
    }

    // 2) Fall back to subdomain match (first label of host)
    const subdomain = host.split(".")[0];
    if (!subdomain) return null;

    const bySubdomain = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", subdomain))
      .first();

    if (bySubdomain) {
      return { workspaceId: bySubdomain.workspaceId, settings: bySubdomain };
    }

    return null;
  },
});
