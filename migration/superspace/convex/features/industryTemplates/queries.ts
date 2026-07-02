import { query } from "../../_generated/server";
import { v } from "convex/values";
import { getAccessibleUserIds } from "../../auth/helpers";

/**
 * Industry Templates Queries
 * Read operations for template discovery and management
 */

// List all public templates with optional filtering
export const getTemplates = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    isOfficial: v.optional(v.boolean()),
    isPremium: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Bounded scan — public template catalog is small
    const allTemplates = await ctx.db
      .query("industryTemplates")
      .filter((q) => q.eq(q.field("visibility"), "public"))
      .take(1000);

    // Apply filters
    let filteredTemplates = allTemplates;

    // Filter by category
    if (args.category) {
      filteredTemplates = filteredTemplates.filter((t) => t.category === args.category);
    }

    // Filter by official status
    if (args.isOfficial !== undefined) {
      filteredTemplates = filteredTemplates.filter((t) => t.isOfficial === args.isOfficial);
    }

    // Filter by premium status
    if (args.isPremium !== undefined) {
      filteredTemplates = filteredTemplates.filter((t) => t.isPremium === args.isPremium);
    }

    // Simple search in name and description
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort by usage count (popularity)
    filteredTemplates.sort((a, b) => b.usageCount - a.usageCount);

    // Apply limit
    const limit = args.limit ?? 20;
    return filteredTemplates.slice(0, limit);
  },
});

// Get template by ID with full details
export const getTemplateById = query({
  args: { templateId: v.id("industryTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) return null;

    // P0-2: non-public templates are owner-only. This table has no
    // organizationId field and no org-membership helper exists, so owner-only
    // is the correct fail-closed gate for "private"/"organization" visibility.
    if (template.visibility !== "public") {
      const callerIds = await getAccessibleUserIds(ctx);
      const owns = callerIds.some((id) => String(id) === String(template.createdBy));
      if (!owns) return null;
    }

    // Get reviews summary
    const reviews = await ctx.db
      .query("templateReviews")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .take(1000);

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    // Get guides
    const guides = await ctx.db
      .query("industryGuides")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .take(1000);

    return {
      ...template,
      reviewStats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
      },
      guides: guides.sort((a, b) => a.order - b.order),
    };
  },
});

// Get templates by category
export const getTemplatesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("industryTemplates")
      .withIndex("by_category", (q) => q.eq("category", args.category as any))
      .filter((q) => q.eq(q.field("visibility"), "public"))
      .take(1000);

    return templates.sort((a, b) => b.usageCount - a.usageCount);
  },
});

// Get featured/official templates
export const getFeaturedTemplates = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("industryTemplates")
      .withIndex("by_is_official", (q) => q.eq("isOfficial", true))
      .filter((q) => q.eq(q.field("visibility"), "public"))
      .take(1000);

    const limit = args.limit ?? 6;
    return templates.sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);
  },
});

// Get popular templates
export const getPopularTemplates = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("industryTemplates")
      .withIndex("by_usage_count")
      .filter((q) => q.eq(q.field("visibility"), "public"))
      .order("desc")
      .take(1000);

    const limit = args.limit ?? 10;
    return templates.slice(0, limit);
  },
});

// Get all categories with counts
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const templates = await ctx.db
      .query("industryTemplates")
      .filter((q) => q.eq(q.field("visibility"), "public"))
      .take(1000);

    const categoryCounts: Record<string, number> = {};
    templates.forEach((t) => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });

    const categoryInfo: Record<string, { name: string; icon: string; description: string }> = {
      restaurant: { name: "Restaurant", icon: "utensils", description: "Restaurants, cafes, bars, and food service" },
      retail: { name: "Retail", icon: "shopping-bag", description: "Stores, boutiques, and e-commerce" },
      healthcare: { name: "Healthcare", icon: "heart-pulse", description: "Clinics, hospitals, and medical practices" },
      education: { name: "Education", icon: "graduation-cap", description: "Schools, tutoring, and training" },
      professional_services: { name: "Professional Services", icon: "briefcase", description: "Law firms, consultants, and agencies" },
      manufacturing: { name: "Manufacturing", icon: "factory", description: "Production and assembly" },
      hospitality: { name: "Hospitality", icon: "bed", description: "Hotels, B&Bs, and vacation rentals" },
      real_estate: { name: "Real Estate", icon: "building", description: "Agents, property management, and development" },
      fitness: { name: "Fitness", icon: "dumbbell", description: "Gyms, studios, and personal training" },
      salon_spa: { name: "Salon & Spa", icon: "scissors", description: "Hair salons, nail bars, and wellness" },
      automotive: { name: "Automotive", icon: "car", description: "Dealerships, repair shops, and services" },
      construction: { name: "Construction", icon: "hard-hat", description: "Contractors, builders, and trades" },
      nonprofit: { name: "Nonprofit", icon: "heart", description: "Charities, foundations, and NGOs" },
      technology: { name: "Technology", icon: "laptop", description: "Software, IT services, and startups" },
      creative_agency: { name: "Creative Agency", icon: "palette", description: "Design, marketing, and media" },
      logistics: { name: "Logistics", icon: "truck", description: "Shipping, warehousing, and delivery" },
      custom: { name: "Custom", icon: "settings", description: "Build your own configuration" },
    };

    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      ...categoryInfo[category],
    }));
  },
});

// Get user's custom templates
export const getMyTemplates = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("industryTemplates")
      .withIndex("by_created_by", (q) => q.eq("createdBy", args.userId))
      .take(1000);

    return templates;
  },
});

// Get user's template customizations
export const getMyCustomizations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const customizations = await ctx.db
      .query("templateCustomizations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(1000);

    // Enrich with original template info
    const enriched = await Promise.all(
      customizations.map(async (c) => {
        const original = await ctx.db.get(c.originalTemplateId);
        return {
          ...c,
          originalTemplate: original ? { name: original.name, category: original.category } : null,
        };
      })
    );

    return enriched;
  },
});

// Get installation history for a workspace
export const getInstallationHistory = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const installations = await ctx.db
      .query("templateInstallations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000);

    // Enrich with template info
    const enriched = await Promise.all(
      installations.map(async (i) => {
        const template = await ctx.db.get(i.templateId);
        const installedByUser = await ctx.db.get(i.installedBy);
        return {
          ...i,
          template: template ? { name: template.name, category: template.category } : null,
          installedByUser: installedByUser ? { name: installedByUser.name } : null,
        };
      })
    );

    return enriched.sort((a, b) => b.installedAt - a.installedAt);
  },
});

// Get reviews for a template
export const getTemplateReviews = query({
  args: {
    templateId: v.id("industryTemplates"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allReviews = await ctx.db
      .query("templateReviews")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .take(1000);

    // Sort by helpful count and then by date
    const sorted = allReviews.sort((a, b) => {
      if (b.helpfulCount !== a.helpfulCount) return b.helpfulCount - a.helpfulCount;
      return b.createdAt - a.createdAt;
    });

    const offset = args.offset ?? 0;
    const limit = args.limit ?? 10;
    const reviews = sorted.slice(offset, offset + limit);

    // Enrich with user info
    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const user = await ctx.db.get(r.userId);
        return {
          ...r,
          user: user ? { name: user.name, avatarUrl: user.avatarUrl } : null,
        };
      })
    );

    return {
      reviews: enriched,
      total: allReviews.length,
      hasMore: offset + limit < allReviews.length,
    };
  },
});

// Get guides for a template
export const getTemplateGuides = query({
  args: { templateId: v.id("industryTemplates") },
  handler: async (ctx, args) => {
    const guides = await ctx.db
      .query("industryGuides")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .take(1000);

    return guides.sort((a, b) => a.order - b.order);
  },
});

// Compare multiple templates
export const compareTemplates = query({
  args: { templateIds: v.array(v.id("industryTemplates")) },
  handler: async (ctx, args) => {
    const templates = await Promise.all(
      args.templateIds.map(async (id) => {
        const template = await ctx.db.get(id);
        if (!template) return null;

        // Get review stats
        const reviews = await ctx.db
          .query("templateReviews")
          .withIndex("by_template", (q) => q.eq("templateId", id))
          .take(1000);

        const totalReviews = reviews.length;
        const averageRating =
          totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        return {
          ...template,
          reviewStats: {
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
          },
        };
      })
    );

    return templates.filter(Boolean);
  },
});

// Search templates with full-text search
export const searchTemplates = query({
  args: { searchQuery: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("industryTemplates")
      .withSearchIndex("search_templates", (q) =>
        q.search("name", args.searchQuery).eq("visibility", "public")
      )
      .take(20);

    return results;
  },
});
