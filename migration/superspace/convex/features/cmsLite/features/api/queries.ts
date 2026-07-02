import { query } from "../../_generated";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated";

/**
 * Get all features for a workspace
 */
export const listAll = query({
  args: {
    workspaceId: v.string(),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const features = await ctx.db
      .query("features")
      .withIndex("by_display_order", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .order("asc")
      .take(2000);

    return features.map(feature => ({
      ...feature,
      title: feature.translations[args.locale]?.title || 
             feature.translations["en"]?.title || 
             feature.key,
      description: feature.translations[args.locale]?.description || 
                  feature.translations["en"]?.description,
      icon: feature.translations[args.locale]?.icon || 
            feature.translations["en"]?.icon,
    }));
  },
});

/**
 * Get active features for a workspace
 */
export const listActive = query({
  args: {
    workspaceId: v.string(),
    locale: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("features")
      .withIndex("by_display_order", (queryBuilder) =>
        queryBuilder.eq("workspaceId", args.workspaceId)
      )
      .filter((queryBuilder) => queryBuilder.eq("status", "active"));

    if (args.type) {
      q = q.filter((q) => q.eq("type", args.type));
    }

    const features = await q.order("asc").take(1000);

    return features.map(feature => ({
      ...feature,
      title: feature.translations[args.locale]?.title || 
             feature.translations["en"]?.title || 
             feature.key,
      description: feature.translations[args.locale]?.description || 
                  feature.translations["en"]?.description,
      icon: feature.translations[args.locale]?.icon || 
            feature.translations["en"]?.icon,
    }));
  },
});

/**
 * Get all feature groups for a workspace
 */
export const listGroups = query({
  args: {
    workspaceId: v.string(),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const groups = await ctx.db
      .query("featureGroups")
      .withIndex("by_display_order", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .order("asc")
      .take(2000);

    return groups.map(group => ({
      ...group,
      title: group.translations[args.locale]?.title || 
             group.translations["en"]?.title || 
             group.name,
      description: group.translations[args.locale]?.description || 
                  group.translations["en"]?.description,
      icon: group.translations[args.locale]?.icon || 
            group.translations["en"]?.icon,
    }));
  },
});

/**
 * Public active-features reader (no auth).
 *
 * Resolves the workspace via website-settings host lookup, then returns the
 * active features ordered by displayOrder with locale-specific text. Caps
 * reads at 200 per the repository's unbounded-query safety pattern.
 */
export const listPublicFeatures = query({
  args: {
    host: v.string(),
    locale: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const rawHost = (args.host ?? "").trim().toLowerCase();
    if (!rawHost) return [];
    const host = rawHost.split(":")[0];

    const byCustom = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_custom_domain", (q) => q.eq("customDomain", host))
      .first();

    const settings =
      byCustom ??
      (await ctx.db
        .query("cms_lite_website_settings")
        .withIndex("by_subdomain", (q) => q.eq("subdomain", host.split(".")[0]))
        .first());

    if (!settings) return [];
    const workspaceId = String(settings.workspaceId);

    let q = ctx.db
      .query("features")
      .withIndex("by_display_order", (queryBuilder) =>
        queryBuilder.eq("workspaceId", workspaceId)
      )
      .filter((queryBuilder) => queryBuilder.eq("status", "active"));

    if (args.type) {
      q = q.filter((inner) => inner.eq("type", args.type));
    }

    const features = await q.order("asc").take(200);

    return features.map((feature) => ({
      ...feature,
      title:
        feature.translations[args.locale]?.title ||
        feature.translations["en"]?.title ||
        feature.key,
      description:
        feature.translations[args.locale]?.description ||
        feature.translations["en"]?.description,
      icon:
        feature.translations[args.locale]?.icon ||
        feature.translations["en"]?.icon,
    }));
  },
});

/**
 * Get feature details
 */
export const getFeature = query({
  args: {
    workspaceId: v.string(),
    key: v.string(),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const feature = await ctx.db
      .query("features")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq("key", args.key))
      .unique();

    if (!feature) return null;

    return {
      ...feature,
      title: feature.translations[args.locale]?.title || 
             feature.translations["en"]?.title || 
             feature.key,
      description: feature.translations[args.locale]?.description || 
                  feature.translations["en"]?.description,
      icon: feature.translations[args.locale]?.icon || 
            feature.translations["en"]?.icon,
    };
  },
});

