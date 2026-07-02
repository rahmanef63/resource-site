import { query } from "../../_generated";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated";

/**
 * Get content for a specific section and locale
 */
export const getContent = query({
  args: {
    workspaceId: v.string(),
    section: v.string(),
    locale: v.string(),
    fallbackLocale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to get content in requested locale
    const content = await ctx.db
      .query("landingContent")
      .withIndex("by_section_locale", (q) =>
        q.eq("workspaceId", args.workspaceId)
         .eq("section", args.section)
         .eq("locale", args.locale)
      )
      .filter((q) => q.eq("status", "published"))
      .unique();

    if (content) {
      return {
        section: args.section,
        locale: args.locale,
        content: content.content,
        metadata: content.metadata,
      };
    }

    // Try fallback locale if provided
    if (args.fallbackLocale) {
      const fallbackLocale = args.fallbackLocale!;
      const fallbackContent = await ctx.db
        .query("landingContent")
        .withIndex("by_section_locale", (q) =>
          q.eq("workspaceId", args.workspaceId)
           .eq("section", args.section)
           .eq("locale", fallbackLocale)
        )
        .filter((q) => q.eq("status", "published"))
        .unique();

      if (fallbackContent) {
        return {
          section: args.section,
          locale: fallbackLocale,
          content: fallbackContent.content,
          metadata: fallbackContent.metadata,
          isFallback: true,
        };
      }
    }

    // Return empty content if nothing found
    return {
      section: args.section,
      locale: args.locale,
      content: {
        type: "text",
      },
      metadata: {},
    };
  },
});

/**
 * Admin listing for the entire landing-content surface (all sections, all
 * locales, any status). Used by the admin editor to hydrate the full grid
 * in one round-trip instead of N `getContent` queries. Caps at 200 rows
 * per the repository's unbounded-query safety pattern.
 */
export const listContents = query({
  args: {
    workspaceId: v.string(),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("landingContent")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(200);

    return rows.map((row) => ({
      _id: row._id,
      section: row.section,
      locale: row.locale,
      status: row.status,
      content: row.content,
      metadata: row.metadata,
      updatedAt: row.updatedAt,
      publishedAt: row.publishedAt,
    }));
  },
});

/**
 * List all sections for a locale
 */
export const listSections = query({
  args: {
    workspaceId: v.string(),
    locale: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("landingContent")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq("locale", args.locale));

    if (args.status) {
      q = q.filter((q) => q.eq("status", args.status));
    }

    const sections = await q.take(200);

    return sections.map(section => ({
      section: section.section,
      locale: section.locale,
      type: section.content.type,
      title: section.content.title,
      status: section.status,
      updatedAt: section.updatedAt,
      publishedAt: section.publishedAt,
    }));
  },
});

/**
 * Get all versions of a section (all locales)
 */
export const getSectionVersions = query({
  args: {
    workspaceId: v.string(),
    section: v.string(),
  },
  handler: async (ctx, args) => {
    const versions = await ctx.db
      .query("landingContent")
      .withIndex("by_section_locale", (q) =>
        q.eq("workspaceId", args.workspaceId)
         .eq("section", args.section)
      )
      .take(2000);

    return versions.map(version => ({
      locale: version.locale,
      status: version.status,
      updatedAt: version.updatedAt,
      publishedAt: version.publishedAt,
      updatedBy: version.updatedBy,
    }));
  },
});

/**
 * Public landing-content reader (no auth).
 *
 * Resolves the workspace via website-settings host lookup, then returns the
 * `published` landing-content entry for `(section, locale)` with `fallbackLocale`
 * fallback. Mirrors `getContent` but keyed on `host` instead of `workspaceId`.
 *
 * Returns `null` when the host does not resolve or the section has no
 * published entry in the requested or fallback locale — caller treats this
 * as "no content yet".
 */
export const getPublicContent = query({
  args: {
    host: v.string(),
    section: v.string(),
    locale: v.string(),
    fallbackLocale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const rawHost = (args.host ?? "").trim().toLowerCase();
    if (!rawHost) return null;
    const host = rawHost.split(":")[0];

    // Resolve workspace via custom domain, then subdomain
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

    if (!settings) return null;

    const workspaceId = String(settings.workspaceId);

    // Try requested locale
    const content = await ctx.db
      .query("landingContent")
      .withIndex("by_section_locale", (q) =>
        q.eq("workspaceId", workspaceId)
         .eq("section", args.section)
         .eq("locale", args.locale)
      )
      .filter((q) => q.eq("status", "published"))
      .unique();

    if (content) {
      return {
        section: args.section,
        locale: args.locale,
        content: content.content,
        metadata: content.metadata,
      };
    }

    // Try fallback locale
    if (args.fallbackLocale) {
      const fallbackLocale = args.fallbackLocale;
      const fallback = await ctx.db
        .query("landingContent")
        .withIndex("by_section_locale", (q) =>
          q.eq("workspaceId", workspaceId)
           .eq("section", args.section)
           .eq("locale", fallbackLocale)
        )
        .filter((q) => q.eq("status", "published"))
        .unique();

      if (fallback) {
        return {
          section: args.section,
          locale: fallbackLocale,
          content: fallback.content,
          metadata: fallback.metadata,
          isFallback: true,
        };
      }
    }

    return null;
  },
});

