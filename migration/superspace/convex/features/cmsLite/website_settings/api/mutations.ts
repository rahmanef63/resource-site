/**
 * CMS Lite Website Settings Mutations
 * 
 * Write operations for website settings. Protected by RBAC.
 */

import { mutation } from "../../../../_generated/server";
import type { MutationCtx } from "../../../../_generated/server";
import { v } from "convex/values";
import { requireAdminForWorkspace } from "../../../lib/rbac";
import { logAuditEvent } from "../../../lib/audit";

/**
 * Update or create website settings for a workspace
 * Requires admin permission
 */
export const updateWebsiteSettings = mutation({
  args: {
    workspaceId: v.id("workspaces"),

    // Domain settings
    subdomain: v.optional(v.string()),
    customDomain: v.optional(v.string()),
    useCustomDomain: v.optional(v.boolean()),

    // SEO settings
    siteTitle: v.optional(v.string()),
    siteDescription: v.optional(v.string()),
    keywords: v.optional(v.string()),
    favicon: v.optional(v.string()),
    ogImage: v.optional(v.string()),

    // Analytics
    googleAnalyticsId: v.optional(v.string()),
    facebookPixelId: v.optional(v.string()),

    // Social media
    twitterHandle: v.optional(v.string()),
    facebookPage: v.optional(v.string()),
    linkedinPage: v.optional(v.string()),

    // Advanced
    robotsTxt: v.optional(v.string()),
    customCss: v.optional(v.string()),
    customHeadCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // RBAC: Require admin permission
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);
    const adminUser = await ctx.db.get(actor.adminUserId);

    if (!adminUser) {
      throw new Error("Admin user not found");
    }

    // Check if settings exist for this workspace
    const existing = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    const now = Date.now();
    const userId = actor.adminUserId;

    // Build update object (only include provided fields)
    const updateData: Record<string, any> = {
      updatedAt: now,
      updatedBy: userId,
    };

    // Add all optional fields if provided
    const fields = [
      'subdomain', 'customDomain', 'useCustomDomain',
      'siteTitle', 'siteDescription', 'keywords', 'favicon', 'ogImage',
      'googleAnalyticsId', 'facebookPixelId',
      'twitterHandle', 'facebookPage', 'linkedinPage',
      'robotsTxt', 'customCss', 'customHeadCode'
    ];

    for (const field of fields) {
      if (args[field as keyof typeof args] !== undefined) {
        updateData[field] = args[field as keyof typeof args];
      }
    }

    let settingsId: any;

    if (existing) {
      // Update existing settings
      await ctx.db.patch(existing._id, updateData);
      settingsId = existing._id;
    } else {
      // Create new settings
      settingsId = await ctx.db.insert("cms_lite_website_settings", {
        workspaceId: args.workspaceId,
        createdAt: now,
        updatedAt: now,
        domainVerified: false,
        ...updateData,
      });
    }

    // Audit log
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "website_settings",
      resourceId: settingsId,
      action: existing ? "website_settings.updated" : "website_settings.created",
      changes: updateData,
    });

    return settingsId;
  },
});

/**
 * Verify domain ownership
 * Checks DNS records and updates verification status
 */
export const verifyDomain = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    domain: v.string(),
  },
  handler: async (ctx, args) => {
    // RBAC: Require admin permission
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);
    const adminUser = await ctx.db.get(actor.adminUserId);

    if (!adminUser) {
      throw new Error("Admin user not found");
    }

    // Get settings
    const settings = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    if (!settings) {
      throw new Error("Website settings not found");
    }

    // TODO: Implement actual DNS verification
    // For now, this is a mock implementation
    // In production, you would:
    // 1. Check A record points to correct IP (e.g., 76.76.21.21)
    // 2. Check CNAME record points to cname.superspace.app
    // 3. Use DNS lookup API or service

    const verified = await mockDnsVerification(args.domain);

    // Update verification status
    await ctx.db.patch(settings._id, {
      domainVerified: verified,
      domainVerifiedAt: verified ? Date.now() : undefined,
      updatedAt: Date.now(),
      // Note: updatedBy expects Id<"users"> but we have Id<"adminUsers">
    });

    // Audit log
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "website_settings",
      resourceId: settings._id,
      action: "website_settings.domain_verification",
      changes: {
        domain: args.domain,
        verified,
        timestamp: Date.now(),
      },
    });

    return { verified };
  },
});

/**
 * Mock DNS verification
 * Replace with actual DNS lookup in production
 */
async function mockDnsVerification(domain: string): Promise<boolean> {
  // Mock: Always return true for development
  // In production, implement actual DNS verification:
  // - Use DNS lookup service (e.g., Google DNS API)
  // - Check A record: domain -> 76.76.21.21
  // - Check CNAME record: domain -> cname.superspace.app

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Mock verification logic
  // In real implementation, this would make DNS queries
  return true;
}

/**
 * Delete website settings
 * Requires admin permission
 */
export const deleteWebsiteSettings = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // RBAC: Require admin permission
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);
    const adminUser = await ctx.db.get(actor.adminUserId);

    if (!adminUser) {
      throw new Error("Admin user not found");
    }

    // Get settings
    const settings = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    if (!settings) {
      throw new Error("Website settings not found");
    }

    // Delete settings
    await ctx.db.delete(settings._id);

    // Audit log
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "website_settings",
      resourceId: settings._id,
      action: "website_settings.deleted",
      changes: {},
    });

    return { success: true };
  },
});
