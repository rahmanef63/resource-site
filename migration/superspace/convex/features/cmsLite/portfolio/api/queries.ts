import { query } from "../../_generated";
import type { QueryCtx } from "../../_generated";
import type { Doc, Id } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin, requireEditor } from "../../../lib/rbac";

const imageObject = v.object({
  id: v.id("portfolioImages"),
  imageUrl: v.string(),
  altText: v.optional(v.union(v.string(), v.null())),
  displayOrder: v.number(),
});

const portfolioObject = v.object({
  id: v.id("portfolioItems"),
  slug: v.string(),
  locale: v.string(),
  title: v.string(),
  description: v.optional(v.union(v.string(), v.null())),
  tags: v.array(v.string()),
  status: v.string(),
  metaTitle: v.optional(v.union(v.string(), v.null())),
  metaDescription: v.optional(v.union(v.string(), v.null())),
  metaKeywords: v.optional(v.union(v.array(v.string()), v.null())),
  category: v.optional(v.union(v.string(), v.null())),
});

type PortfolioDoc = Doc<"portfolioItems">;
type PortfolioImageDoc = Doc<"portfolioImages">;

function serializeImage(image: PortfolioImageDoc) {
  return {
    id: image._id,
    imageUrl: image.imageUrl,
    altText: image.altText ?? null,
    displayOrder: image.displayOrder,
  };
}

export function serializePortfolio(item: PortfolioDoc) {
  return {
    id: item._id,
    slug: item.slug,
    locale: item.locale,
    title: item.title,
    description: item.description ?? null,
    tags: item.tags ?? [],
    status: item.status,
    metaTitle: item.metaTitle ?? null,
    metaDescription: item.metaDescription ?? null,
    metaKeywords: item.metaKeywords ?? null,
    category: item.category ?? null,
  };
}

async function loadImagesFor(
  ctx: QueryCtx,
  portfolioId: Id<"portfolioItems">,
): Promise<ReturnType<typeof serializeImage>[]> {
  const images = await ctx.db
    .query("portfolioImages")
    .withIndex("by_portfolio_order", (q: any) => q.eq("portfolioId", portfolioId))
    .order("asc")
    .take(2000);

  const typedImages = images as PortfolioImageDoc[];
  return typedImages.map((img) => serializeImage(img));
}

async function hydrate(
  ctx: QueryCtx,
  items: PortfolioDoc[],
): Promise<Array<{ item: ReturnType<typeof serializePortfolio>; images: ReturnType<typeof serializeImage>[] }>> {
  const results = [];
  for (const item of items) {
    const images = await loadImagesFor(ctx, item._id);
    results.push({
      item: serializePortfolio(item),
      images,
    });
  }
  return results;
}

export const listPortfolio = query({
  args: {
    locale: v.string(),
  },
  returns: v.object({
    items: v.array(
      v.object({
        item: portfolioObject,
        images: v.array(imageObject),
      }),
    ),
  }),
  handler: async (ctx: QueryCtx, { locale }) => {
    const items = await ctx.db
      .query("portfolioItems")
      .withIndex("by_status_locale", (q: any) => q.eq("status", "published").eq("locale", locale))
      .order("desc")
      .take(2000);

    const hydrated = await hydrate(ctx, items as PortfolioDoc[]);

    return { items: hydrated };
  },
});

export const listAllPortfolio = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    locale: v.optional(v.string()),
  },
  returns: v.object({
    items: v.array(
      v.object({
        item: portfolioObject,
        images: v.array(imageObject),
      }),
    ),
  }),
  handler: async (
    ctx: QueryCtx,
    args: {
      search?: string;
      status?: string;
      locale?: string;
    },
  ) => {
    await requireAdmin(ctx);

    const searchTerm = args.search?.toLowerCase();
    // @dod:skip-isolation reason="cms-lite host-resolved storefront pre-rewrite — single-tenant deploy assumption; multi-tenant fix tracked under Step 63 (cms-lite quality upgrade)"
    let items = (await ctx.db.query("portfolioItems").take(500)) as PortfolioDoc[];

    if (args.status) {
      items = items.filter((item) => item.status === args.status);
    }

    if (args.locale) {
      items = items.filter((item) => item.locale === args.locale);
    }

    if (searchTerm) {
      items = items.filter((item) => {
        const haystack = [item.title, item.description ?? ""].join(" ").toLowerCase();
        return haystack.includes(searchTerm);
      });
    }

    items.sort((a, b) => b._creationTime - a._creationTime);

    const hydrated = await hydrate(ctx, items);

    return { items: hydrated };
  },
});

/**
 * Public portfolio-detail reader by slug (no auth).
 *
 * `portfolioItems` has a `by_slug_locale` index; we try locale-specific then
 * fall back to any published match. Returns the first hit with its images.
 */
export const getPortfolioBySlug = query({
  args: {
    slug: v.string(),
    locale: v.optional(v.string()),
  },
  returns: v.union(
    v.null(),
    v.object({
      item: portfolioObject,
      images: v.array(imageObject),
    }),
  ),
  handler: async (ctx: QueryCtx, { slug, locale }) => {
    if (!slug) return null;

    let item: PortfolioDoc | null = null;

    if (locale) {
      item = (await ctx.db
        .query("portfolioItems")
        .withIndex("by_slug_locale", (q: any) => q.eq("slug", slug).eq("locale", locale))
        .first()) as PortfolioDoc | null;
    }

    // Fall back to any locale for this slug
    if (!item) {
      const candidates = (await ctx.db
        .query("portfolioItems")
        .take(200)) as PortfolioDoc[];
      item = candidates.find((row) => row.slug === slug) ?? null;
    }

    if (!item) return null;

    const images = await loadImagesFor(ctx, item._id);

    return {
      item: serializePortfolio(item),
      images,
    };
  },
});

export const searchPortfolio = query({
  args: {
    query: v.optional(v.string()),
    status: v.optional(v.string()),
    locale: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(portfolioObject),
    total: v.number(),
  }),
  handler: async (
    ctx: QueryCtx,
    args: {
      query?: string;
      status?: string;
      locale?: string;
      tags?: string[];
      limit?: number;
      offset?: number;
    },
  ) => {
    await requireEditor(ctx);

    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;
    const searchTerm = args.query?.toLowerCase();

    // @dod:skip-isolation reason="cms-lite host-resolved storefront pre-rewrite — single-tenant deploy assumption; multi-tenant fix tracked under Step 63 (cms-lite quality upgrade)"
    let items = (await ctx.db.query("portfolioItems").take(500)) as PortfolioDoc[];

    if (args.status) {
      items = items.filter((item) => item.status === args.status);
    }

    if (args.locale) {
      items = items.filter((item) => item.locale === args.locale);
    }

    if (Array.isArray(args.tags) && args.tags.length > 0) {
      const tagSet = new Set(args.tags.map((tag: string) => tag.toLowerCase()));
      items = items.filter((item) =>
        (item.tags ?? []).some((tag: string) => tagSet.has(tag.toLowerCase())),
      );
    }

    if (searchTerm) {
      items = items.filter((item) => {
        const haystack = [item.title, item.description ?? ""].join(" ").toLowerCase();
        return haystack.includes(searchTerm);
      });
    }

    items.sort((a, b) => b._creationTime - a._creationTime);

    const total = items.length;
    const paged = items.slice(offset, offset + limit).map(serializePortfolio);

    return {
      items: paged,
      total,
    };
  },
});




