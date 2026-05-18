import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Document Checklist tables — slug-prefixed per kitab convention.
 *
 * User-scoped. Each authenticated user owns exactly one
 * `document_checklist_items` row containing the full document list.
 *
 * `document_checklist_templates` is a shared, country-keyed master
 * list — seeded by ops via the admin Engine Seed flow.
 */
export const documentChecklistTables = {
  document_checklist_items: defineTable({
    userId: v.id("users"),
    type: v.string(),
    country: v.optional(v.string()),
    documents: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        category: v.string(),
        subcategory: v.optional(v.string()),
        required: v.boolean(),
        completed: v.boolean(),
        notes: v.string(),
        expiryDate: v.optional(v.string()),
      }),
    ),
    progress: v.number(),
  }).index("by_user", ["userId"]),

  /**
   * Shared, country-scoped document master list. Seeded from
   * country-specific seed files via the admin Engine Seed panel.
   * Frontend reads per-country to pre-populate a personal checklist.
   */
  document_checklist_templates: defineTable({
    /** ISO-3166-1 alpha-2, uppercased. "ID" / "JP" / "DE". */
    country: v.string(),
    /** Human-readable label, e.g. "Indonesia". */
    countryLabel: v.string(),
    /** Optional emoji flag. */
    flag: v.optional(v.string()),
    /** Short description of the migration / work track. */
    description: v.optional(v.string()),
    documents: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        description: v.string(),
        category: v.string(),
        subcategory: v.optional(v.string()),
        required: v.boolean(),
        issuingAuthority: v.optional(v.string()),
        validityYears: v.optional(v.number()),
        notes: v.optional(v.string()),
      }),
    ),
    /** True = seed-managed; false = user/admin custom override. */
    isSystem: v.boolean(),
  }).index("by_country", ["country"]),
};
