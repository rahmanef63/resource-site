import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { commentsTables } from "./features/comments/_schema";
import { notionTables } from "./features/notion/_schema";

// Konsultan OS — full schema (Convex target).
// authTables = @convex-dev/auth. Content tables mirror the localStorage shape
// the frontend store used (shared/types.ts + shared/seed.ts), so the
// Convex-backed store adapter maps 1:1 (frontend `id` <-> Convex `_id`).
export default defineSchema({
  ...authTables,
  ...commentsTables,
  ...notionTables,

  konsultanClients: defineTable({
    name: v.string(),
    company: v.string(),
    industry: v.string(),
    email: v.string(),
    phone: v.string(),
    city: v.string(),
    status: v.union(v.literal("lead"), v.literal("active"), v.literal("completed")),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  konsultanProposals: defineTable({
    clientId: v.string(),
    title: v.string(),
    scope: v.string(),
    valueLabel: v.string(),
    durationLabel: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  konsultanContracts: defineTable({
    proposalId: v.string(),
    clientId: v.string(),
    title: v.string(),
    termsSummary: v.string(),
    status: v.union(v.literal("draft"), v.literal("signed"), v.literal("expired")),
    signedAt: v.number(),
    endsAt: v.number(),
  }).index("by_status", ["status"]),

  konsultanProjects: defineTable({
    contractId: v.string(),
    clientId: v.string(),
    name: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("kickoff"),
      v.literal("in-progress"),
      v.literal("review"),
      v.literal("delivered"),
    ),
    progress: v.number(),
    startedAt: v.number(),
    endsAt: v.number(),
    icon: v.optional(v.string()),
  }).index("by_status", ["status"]),

  konsultanInvoices: defineTable({
    projectId: v.string(),
    clientId: v.string(),
    number: v.string(),
    amountLabel: v.string(),
    ppnLabel: v.string(),
    totalLabel: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
    ),
    dueAt: v.number(),
    issuedAt: v.number(),
  }).index("by_status", ["status"]),

  konsultanDocuments: defineTable({
    projectId: v.string(),
    title: v.string(),
    kind: v.union(
      v.literal("deliverable"),
      v.literal("memo"),
      v.literal("minutes"),
      v.literal("report"),
    ),
    status: v.union(v.literal("draft"), v.literal("shared")),
    updatedAt: v.number(),
  }),

  konsultanCalendarEvents: defineTable({
    title: v.string(),
    clientId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    kind: v.union(
      v.literal("session"),
      v.literal("deadline"),
      v.literal("workshop"),
      v.literal("internal"),
    ),
    dayOfWeek: v.number(),
    hour: v.number(),
    durationHours: v.number(),
    location: v.string(),
    notes: v.optional(v.string()),
  }),

  konsultanKbArticles: defineTable({
    slug: v.string(),
    title: v.string(),
    category: v.union(
      v.literal("Strategi"),
      v.literal("Operasi"),
      v.literal("Organisasi"),
      v.literal("M&A"),
      v.literal("Workshop"),
      v.literal("Template"),
    ),
    summary: v.string(),
    body: v.string(),
    author: v.string(),
    updatedAt: v.number(),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

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
