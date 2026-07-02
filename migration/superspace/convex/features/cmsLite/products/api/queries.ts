import { query } from "../../_generated";
import type { QueryCtx } from "../../_generated";
import type { Doc } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin, requireEditor } from "../../../lib/rbac";

export const productObject = v.object({
  id: v.id("products"),
  slug: v.string(),
  titleId: v.string(),
  titleEn: v.string(),
  titleAr: v.string(),
  descId: v.optional(v.union(v.string(), v.null())),
  descEn: v.optional(v.union(v.string(), v.null())),
  descAr: v.optional(v.union(v.string(), v.null())),
  price: v.number(),
  currency: v.string(),
  paymentLink: v.optional(v.union(v.string(), v.null())),
  coverImage: v.optional(v.union(v.string(), v.null())),
  status: v.string(),
  metaTitle: v.optional(v.union(v.string(), v.null())),
  metaDescription: v.optional(v.union(v.string(), v.null())),
  metaKeywords: v.optional(v.union(v.array(v.string()), v.null())),
  scheduledActivateAt: v.optional(v.union(v.number(), v.null())),
  autoActivated: v.optional(v.boolean()),
  available: v.optional(v.boolean()),
});

export function serializeProduct(product: Doc<"products">) {
  return {
    id: product._id,
    slug: product.slug,
    titleId: product.titleId,
    titleEn: product.titleEn,
    titleAr: product.titleAr,
    descId: product.descId ?? null,
    descEn: product.descEn ?? null,
    descAr: product.descAr ?? null,
    price: product.price,
    currency: product.currency,
    paymentLink: product.paymentLink ?? null,
    coverImage: product.coverImage ?? null,
    status: product.status,
    metaTitle: product.metaTitle ?? null,
    metaDescription: product.metaDescription ?? null,
    metaKeywords: product.metaKeywords ?? null,
    scheduledActivateAt: product.scheduledActivateAt ?? null,
    autoActivated: product.autoActivated ?? false,
    available: product.available ?? undefined,
  };
}

type ProductDoc = Doc<"products">;

export const listProducts = query({
  args: {},
  returns: v.object({
    products: v.array(productObject),
  }),
  handler: async (ctx: QueryCtx) => {
    // @dod:skip-isolation reason="cms-lite host-resolved storefront pre-rewrite — single-tenant deploy assumption; multi-tenant fix tracked under Step 63 (cms-lite quality upgrade)"
    const products = (await ctx.db.query("products").take(500)) as ProductDoc[];
    const filtered = products
      .filter((product: ProductDoc) => product.status === "published")
      .sort((a: ProductDoc, b: ProductDoc) => b._creationTime - a._creationTime);

    return {
      products: filtered.map(serializeProduct),
    };
  },
});

export const listAllProducts = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  returns: v.object({
    products: v.array(productObject),
  }),
  handler: async (
    ctx: QueryCtx,
    args: {
      search?: string;
      status?: string;
    },
  ) => {
    await requireAdmin(ctx);

    const searchTerm = args.search?.toLowerCase();
    // @dod:skip-isolation reason="cms-lite host-resolved storefront pre-rewrite — single-tenant deploy assumption; multi-tenant fix tracked under Step 63 (cms-lite quality upgrade)"
    const products = (await ctx.db.query("products").take(500)) as ProductDoc[];

    const filtered = products
      .filter((product: ProductDoc) => {
        if (args.status && product.status !== args.status) {
          return false;
        }
        if (searchTerm) {
          const candidates = [
            product.titleEn,
            product.titleAr,
            product.titleId,
            product.descEn ?? "",
            product.descAr ?? "",
            product.descId ?? "",
          ]
            .join(" ")
            .toLowerCase();
          return candidates.includes(searchTerm);
        }
        return true;
      })
      .sort((a: ProductDoc, b: ProductDoc) => b._creationTime - a._creationTime);

    return {
      products: filtered.map(serializeProduct),
    };
  },
});

export const getProductBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.object({
    product: productObject,
  }),
  handler: async (ctx: QueryCtx, { slug }: { slug: string }) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .first();

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      product: serializeProduct(product),
    };
  },
});

export const searchProducts = query({
  args: {
    query: v.optional(v.string()),
    status: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  returns: v.object({
    products: v.array(productObject),
    total: v.number(),
  }),
  handler: async (
    ctx: QueryCtx,
    args: {
      query?: string;
      status?: string;
      minPrice?: number;
      maxPrice?: number;
      limit?: number;
      offset?: number;
    },
  ) => {
    await requireEditor(ctx);

    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;
    const searchTerm = args.query?.toLowerCase();

    // @dod:skip-isolation reason="cms-lite host-resolved storefront pre-rewrite — single-tenant deploy assumption; multi-tenant fix tracked under Step 63 (cms-lite quality upgrade)"
    let products = (await ctx.db.query("products").take(500)) as ProductDoc[];

    if (args.status) {
      products = products.filter((product: ProductDoc) => product.status === args.status);
    }
    if (typeof args.minPrice === "number") {
      products = products.filter((product: ProductDoc) => product.price >= args.minPrice!);
    }
    if (typeof args.maxPrice === "number") {
      products = products.filter((product: ProductDoc) => product.price <= args.maxPrice!);
    }
    if (searchTerm) {
      products = products.filter((product: ProductDoc) => {
        const haystack = [
          product.titleId,
          product.titleEn,
          product.titleAr,
          product.descId ?? "",
          product.descEn ?? "",
          product.descAr ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(searchTerm);
      });
    }

    products.sort((a: ProductDoc, b: ProductDoc) => b._creationTime - a._creationTime);

    const total = products.length;
    const page = products.slice(offset, offset + limit);

    return {
      products: page.map(serializeProduct),
      total,
    };
  },
});


