import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { commentsTables } from "./features/comments/_schema";
import { notionTables } from "./features/notion/_schema";

// Wirausaha OS — full schema (Convex target).
// authTables = @convex-dev/auth. Content tables mirror the localStorage shape
// the frontend store used, so the Convex-backed store adapter maps 1:1.
export default defineSchema({
  ...authTables,
  ...commentsTables,
  ...notionTables,

  wirausahaBusinesses: defineTable({
    name: v.string(),
    type: v.string(),
    city: v.string(),
    staffCount: v.number(),
    monthlyRevenue: v.number(),
    status: v.union(v.literal("active"), v.literal("paused")),
  }).index("by_status", ["status"]),

  wirausahaProducts: defineTable({
    businessId: v.string(),
    name: v.string(),
    sku: v.string(),
    priceLabel: v.string(),
    stock: v.number(),
    unit: v.string(),
    // icon-picker / image-picker slice values (optional, additive).
    icon: v.optional(v.string()),
    image: v.optional(v.string()),
  }).index("by_business", ["businessId"]),

  wirausahaOrders: defineTable({
    businessId: v.string(),
    customerId: v.string(),
    items: v.array(
      v.object({ productId: v.string(), qty: v.number(), priceLabel: v.string() }),
    ),
    totalLabel: v.string(),
    status: v.union(
      v.literal("new"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
    ts: v.number(),
  }).index("by_status", ["status"]),

  wirausahaCustomers: defineTable({
    name: v.string(),
    phone: v.string(),
    city: v.string(),
    totalSpentLabel: v.string(),
    orderCount: v.number(),
  }),

  wirausahaFinance: defineTable({
    businessId: v.string(),
    kind: v.union(v.literal("income"), v.literal("expense")),
    category: v.string(),
    amountLabel: v.string(),
    note: v.string(),
    ts: v.number(),
  }).index("by_business", ["businessId"]),

  wirausahaStaff: defineTable({
    businessId: v.string(),
    name: v.string(),
    role: v.string(),
    phone: v.string(),
    joinedAt: v.number(),
  }).index("by_business", ["businessId"]),

  wirausahaCatalog: defineTable({
    productId: v.optional(v.string()),
    slug: v.string(),
    name: v.string(),
    category: v.string(),
    priceLabel: v.string(),
    blurb: v.string(),
    badge: v.optional(v.string()),
    emoji: v.string(),
    gradient: v.string(),
  }).index("by_slug", ["slug"]),

  wirausahaStores: defineTable({
    name: v.string(),
    businessId: v.optional(v.string()),
    city: v.string(),
    address: v.string(),
    phone: v.string(),
    hours: v.string(),
    mapsUrl: v.optional(v.string()),
    emoji: v.string(),
    gradient: v.string(),
  }),

  wirausahaJournal: defineTable({
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    category: v.string(),
    author: v.string(),
    publishedAt: v.number(),
    emoji: v.string(),
    gradient: v.string(),
  }).index("by_slug", ["slug"]),

  wirausahaReviews: defineTable({
    author: v.string(),
    city: v.string(),
    category: v.string(),
    storeId: v.optional(v.string()),
    rating: v.number(),
    body: v.string(),
    emoji: v.string(),
    publishedAt: v.number(),
  }),

  wirausahaPromotions: defineTable({
    code: v.string(),
    label: v.string(),
    kind: v.union(v.literal("percent"), v.literal("rupiah")),
    value: v.number(),
    startAt: v.number(),
    endAt: v.number(),
    usageLimit: v.number(),
    usedCount: v.number(),
    targetSku: v.optional(v.string()),
    targetCategory: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("scheduled"),
      v.literal("expired"),
      v.literal("paused"),
    ),
  }).index("by_status", ["status"]),

  wirausahaSuppliers: defineTable({
    name: v.string(),
    contactPerson: v.string(),
    phone: v.string(),
    city: v.string(),
    leadTimeDays: v.number(),
    terms: v.string(),
    category: v.string(),
    linkedSkus: v.array(v.string()),
    note: v.optional(v.string()),
  }),

  // Page-builder + landing: complex nested structures stored as blobs keyed by
  // the frontend's string id (PageEntry.id / LandingSection.id).
  pages: defineTable({
    entryId: v.string(),
    slug: v.string(),
    data: v.any(),
  })
    .index("by_entryId", ["entryId"])
    .index("by_slug", ["slug"]),

  landingSections: defineTable({
    sectionId: v.string(),
    data: v.any(),
  }).index("by_sectionId", ["sectionId"]),

  // Singleton site config — onboarding wizard + admin Settings write this.
  siteSettings: defineTable({
    siteName: v.optional(v.string()),
    tagline: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    brandColor: v.optional(v.string()),
    themeDefault: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
    socials: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    analyticsId: v.optional(v.string()),
    onboardedAt: v.optional(v.number()),
  }),
});
