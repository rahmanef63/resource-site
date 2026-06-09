import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { commentsTables } from "./features/comments/_schema";
import { notionTables } from "./features/notion/_schema";

// Riset Kit OS — full schema (Convex target).
// authTables = @convex-dev/auth. Content tables mirror the localStorage shape
// the frontend store used, so the Convex-backed store adapter maps 1:1.
export default defineSchema({
  ...authTables,
  ...commentsTables,
  ...notionTables,

  risetDocuments: defineTable({
    title: v.string(),
    authors: v.string(),
    year: v.number(),
    fileLabel: v.string(),
    abstract: v.string(),
    tag: v.string(),
    status: v.union(
      v.literal("uploaded"),
      v.literal("indexed"),
      v.literal("reviewed"),
    ),
    uploadedAt: v.number(),
    pages: v.number(),
    highlights: v.number(),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_uploadedAt", ["uploadedAt"]),

  risetNotes: defineTable({
    title: v.string(),
    body: v.string(),
    tags: v.array(v.string()),
    linkedDocIds: v.array(v.string()),
    updatedAt: v.number(),
  }).index("by_updatedAt", ["updatedAt"]),

  risetCitations: defineTable({
    docId: v.string(),
    style: v.union(
      v.literal("APA"),
      v.literal("MLA"),
      v.literal("Chicago"),
      v.literal("IEEE"),
      v.literal("BibTeX"),
    ),
    rendered: v.string(),
    bibKey: v.string(),
    addedAt: v.number(),
  }).index("by_docId", ["docId"]),

  risetLitReviews: defineTable({
    topic: v.string(),
    question: v.string(),
    docIds: v.array(v.string()),
    matrix: v.array(
      v.object({
        docId: v.string(),
        method: v.string(),
        finding: v.string(),
        gap: v.string(),
      }),
    ),
    updatedAt: v.number(),
    icon: v.optional(v.string()),
  }).index("by_updatedAt", ["updatedAt"]),

  risetAiSessions: defineTable({
    docId: v.string(),
    question: v.string(),
    answer: v.string(),
    ts: v.number(),
  }).index("by_ts", ["ts"]),

  risetProjects: defineTable({
    title: v.string(),
    hypothesis: v.string(),
    status: v.union(
      v.literal("exploring"),
      v.literal("active"),
      v.literal("writing"),
      v.literal("submitted"),
      v.literal("archived"),
    ),
    startedAt: v.number(),
    updatedAt: v.number(),
    targetVenue: v.string(),
    linkedDocIds: v.array(v.string()),
    linkedNoteIds: v.array(v.string()),
    collaboratorIds: v.array(v.string()),
    progress: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_updatedAt", ["updatedAt"]),

  risetDatasets: defineTable({
    name: v.string(),
    source: v.string(),
    format: v.union(
      v.literal("csv"),
      v.literal("json"),
      v.literal("parquet"),
      v.literal("xlsx"),
      v.literal("geojson"),
      v.literal("sav"),
    ),
    rows: v.number(),
    sizeMB: v.number(),
    license: v.string(),
    lastUpdated: v.number(),
    description: v.string(),
    url: v.string(),
  }).index("by_lastUpdated", ["lastUpdated"]),

  risetCollaborators: defineTable({
    name: v.string(),
    affiliation: v.string(),
    role: v.union(
      v.literal("PI"),
      v.literal("co-author"),
      v.literal("advisor"),
      v.literal("RA"),
      v.literal("external"),
    ),
    orcid: v.string(),
    email: v.string(),
    expertise: v.array(v.string()),
    projectIds: v.array(v.string()),
    initials: v.string(),
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
