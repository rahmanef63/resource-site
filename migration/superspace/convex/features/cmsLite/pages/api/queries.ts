import { v } from "convex/values";
import { query } from "../../../../_generated/server";

/**
 * Get page by slug (public query)
 * Supports multi-language slugs (English, Arabic, Russian, etc.)
 */
export const getPageBySlug = query({
  args: { 
    slug: v.string(),
    workspaceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { slug, workspaceId } = args;
    
    // Build query
    let pagesQuery = ctx.db
      .query("cms_lite_pages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .filter((q) => q.eq(q.field("isPublished"), true));
    
    // If workspaceId provided, filter by it
    if (workspaceId) {
      pagesQuery = pagesQuery.filter((q) => q.eq(q.field("workspaceId"), workspaceId));
    }
    
    const page = await pagesQuery.first();
    
    return page;
  },
});

/**
 * List all published pages (public query)
 */
export const listPages = query({
  args: { 
    workspaceId: v.optional(v.string()),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { workspaceId, locale } = args;
    
    let query = ctx.db
      .query("cms_lite_pages")
      .withIndex("by_published", (q) => q.eq("isPublished", true));
    
    // Apply filters
    if (workspaceId) {
      query = query.filter((q) => q.eq(q.field("workspaceId"), workspaceId));
    }
    
    if (locale) {
      query = query.filter((q) => q.eq(q.field("locale"), locale));
    }
    
    const pages = await query
      .order("desc")
      .take(2000);
    
    // Sort by displayOrder if available
    pages.sort((a, b) => {
      const orderA = a.displayOrder ?? 999;
      const orderB = b.displayOrder ?? 999;
      return orderA - orderB;
    });
    
    return { pages };
  },
});

/**
 * Get pages by locale
 */
export const getPagesByLocale = query({
  args: { 
    locale: v.string(),
    workspaceId: v.string(),
  },
  handler: async (ctx, args) => {
    const { locale, workspaceId } = args;
    
    const pages = await ctx.db
      .query("cms_lite_pages")
      .withIndex("by_workspace_locale", (q) => 
        q.eq("workspaceId", workspaceId).eq("locale", locale)
      )
      .filter((q) => q.eq(q.field("isPublished"), true))
      .take(2000);
    
    return { pages };
  },
});
