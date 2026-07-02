import { mutation } from "../../_generated";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated";
import { requireAdminForWorkspace } from "../../../lib/rbac";
import { logAuditEvent } from "../../../lib/audit";

/**
 * Update landing page section content
 */
export const updateContent = mutation({
  args: {
    workspaceId: v.string(),
    section: v.string(),
    locale: v.string(),
    content: v.object({
      type: v.string(),
      title: v.optional(v.string()),
      subtitle: v.optional(v.string()),
      description: v.optional(v.string()),
      primaryCta: v.optional(v.object({
        text: v.string(),
        url: v.string(),
        variant: v.optional(v.string()),
      })),
      secondaryCta: v.optional(v.object({
        text: v.string(),
        url: v.string(),
        variant: v.optional(v.string()),
      })),
      media: v.optional(v.array(v.object({
        type: v.string(),
        url: v.string(),
        alt: v.optional(v.string()),
        caption: v.optional(v.string()),
      }))),
      items: v.optional(v.array(v.object({
        id: v.string(),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        image: v.optional(v.string()),
        link: v.optional(v.string()),
      }))),
      layout: v.optional(v.object({
        style: v.optional(v.string()),
        columns: v.optional(v.number()),
        align: v.optional(v.string()),
      })),
      settings: v.optional(v.record(v.string(), v.any())),
    }),
    metadata: v.optional(v.object({
      seo: v.optional(v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        keywords: v.optional(v.array(v.string())),
        image: v.optional(v.string()),
      })),
      schedule: v.optional(v.object({
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
      })),
    })),
    status: v.optional(v.string()),
    publish: v.optional(v.boolean()),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const existing = await ctx.db
      .query("landingContent")
      .withIndex("by_section_locale", (q) =>
        q.eq("workspaceId", args.workspaceId)
          .eq("section", args.section)
          .eq("locale", args.locale)
      )
      .unique();

    const now = Date.now();
    const updates: any = {
      content: args.content,
      updatedAt: now,
      updatedBy: args.updatedBy || actor.clerkUserId,
    };

    if (args.metadata) {
      updates.metadata = {
        ...(existing?.metadata || {}),
        ...args.metadata,
      };
    }

    if (args.status) {
      updates.status = args.status;
    }

    if (args.publish) {
      updates.status = "published";
      updates.publishedAt = now;
      updates.publishedBy = args.updatedBy || actor.clerkUserId;
    }

    let id: Id<"landingContent">;
    let action = "landing.update";

    if (existing) {
      await ctx.db.patch(existing._id, updates);
      id = existing._id;
    } else {
      id = await ctx.db.insert("landingContent", {
        workspaceId: args.workspaceId,
        section: args.section,
        locale: args.locale,
        status: args.status || "draft",
        ...updates,
        createdAt: now,
        createdBy: args.updatedBy || actor.clerkUserId,
      });
      action = "landing.create";
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "landingContent",
      resourceId: id,
      action,
      changes: updates,
    });

    return id;
  },
});

/**
 * Delete a landing page section
 */
export const deleteSection = mutation({
  args: {
    workspaceId: v.string(),
    section: v.string(),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    let query = ctx.db
      .query("landingContent")
      .withIndex("by_section_locale", (q) =>
        q.eq("workspaceId", args.workspaceId)
          .eq("section", args.section)
      );

    if (args.locale) {
      query = query.filter((q) => q.eq("locale", args.locale));
    }

    const sections = await query.take(200);

    for (const section of sections) {
      await ctx.db.delete(section._id);
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "landingContent",
      action: "landing.delete",
      changes: { section: args.section, locale: args.locale, count: sections.length },
    });

    return {
      deleted: sections.length,
    };
  },
});

/**
 * Update analytics data for a section
 */
export const updateAnalytics = mutation({
  args: {
    workspaceId: v.string(),
    section: v.string(),
    locale: v.string(),
    views: v.optional(v.number()),
    clicks: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Analytics updates might be automated, but if called via mutation, we require admin or system?
    // For now, let's assume admin for safety, or we could skip auth if it's a public tracking pixel.
    // Given the context of CMS Lite, this likely comes from the dashboard or a privileged job.
    // If it comes from public site, this should be a public mutation without requireAdmin.
    // But validation complains if we don't audit log?
    // Let's assume it's an admin function for manual adjustment OR needing audit.
    // If it's public analytics, it shouldn't be in 'api/mutations.ts' protected by nothing.
    // I'll add requireAdmin to be safe.
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const section = await ctx.db
      .query("landingContent")
      .withIndex("by_section_locale", (q) =>
        q.eq("workspaceId", args.workspaceId)
          .eq("section", args.section)
          .eq("locale", args.locale)
      )
      .unique();

    if (!section) return null;

    const analytics = section.metadata?.analytics || {};
    const updates = {
      metadata: {
        ...section.metadata,
        analytics: {
          views: (analytics.views || 0) + (args.views || 0),
          clicks: (analytics.clicks || 0) + (args.clicks || 0),
          lastViewedAt: Date.now(),
        },
      },
    };

    await ctx.db.patch(section._id, updates);

    // Analytics updates might be too noisy for audit log, but for completeness:
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "landingContent",
      resourceId: section._id,
      action: "landing.analytics_update",
      changes: { views: args.views, clicks: args.clicks },
    });

    return section._id;
  },
});

