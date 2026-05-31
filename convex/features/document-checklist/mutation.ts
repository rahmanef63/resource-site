import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireUser } from "../../_shared/auth";
import {
  MAX_COUNTRY_LEN, MAX_DATE_LEN, MAX_DOCS, MAX_ID_LEN, MAX_NOTES_LEN,
  MAX_TYPE_LEN, applyDocStatus, computeProgress, mergePriorChecklist,
  mergeTemplateForInstantiate, normalizeSeedTemplate, trimLen,
} from "./_mutation-helpers";

/**
 * Idempotent seed of the user's checklist row. Re-running with a new
 * template merges over the existing row, preserving completed/notes/expiry
 * on matching ids.
 */
export const seed = mutation({
  args: {
    type: v.string(),
    country: v.optional(v.string()),
    template: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        category: v.string(),
        subcategory: v.optional(v.string()),
        required: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);

    const type = trimLen("Tipe", args.type, MAX_TYPE_LEN);
    const country = args.country
      ? trimLen("Negara", args.country, MAX_COUNTRY_LEN)
      : undefined;

    if (args.template.length === 0 || args.template.length > MAX_DOCS) {
      throw new Error(`Template 1-${MAX_DOCS} dokumen`);
    }

    const documents = normalizeSeedTemplate(args.template);

    const existing = await ctx.db
      .query("document_checklist_items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      const merged = mergePriorChecklist(documents, existing.documents);
      await ctx.db.patch(existing._id, {
        type,
        country,
        documents: merged,
        progress: computeProgress(merged),
      });
      return existing._id;
    }

    return await ctx.db.insert("document_checklist_items", {
      userId,
      type,
      country,
      documents,
      progress: 0,
    });
  },
});

/**
 * Update a single document item's completed/notes/expiry. Errors when
 * the user has no row yet — frontend should call `seed` first.
 */
export const updateStatus = mutation({
  args: {
    documentId: v.string(),
    completed: v.boolean(),
    notes: v.optional(v.string()),
    expiryDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);

    const documentId = trimLen("ID dokumen", args.documentId, MAX_ID_LEN);
    const notes =
      args.notes !== undefined
        ? args.notes.trim().slice(0, MAX_NOTES_LEN)
        : undefined;
    const expiryDate =
      args.expiryDate !== undefined
        ? args.expiryDate.trim().slice(0, MAX_DATE_LEN)
        : undefined;

    const checklist = await ctx.db
      .query("document_checklist_items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!checklist) throw new Error("Checklist tidak ditemukan");

    const { documents: updatedDocuments, touched } = applyDocStatus(
      checklist.documents,
      documentId,
      { completed: args.completed, notes, expiryDate },
    );
    if (!touched) throw new Error("Dokumen tidak ditemukan");

    await ctx.db.patch(checklist._id, {
      documents: updatedDocuments,
      progress: computeProgress(updatedDocuments),
    });
  },
});

/** Wipe the user's checklist row. */
export const reset = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const existing = await ctx.db
      .query("document_checklist_items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) await ctx.db.delete(existing._id);
  },
});

/**
 * Instantiate the user's personal `document_checklist_items` row from a
 * country's `document_checklist_templates` master list. Preserves prior
 * completion / notes / expiry on matching document ids (same merge
 * logic as `seed`).
 *
 * Idempotent — re-running same country re-merges over current state.
 */
export const instantiateFromTemplate = mutation({
  args: { country: v.string() },
  returns: v.object({
    checklistId: v.id("document_checklist_items"),
    inserted: v.number(),
    preserved: v.number(),
  }),
  handler: async (ctx, { country }) => {
    const userId = await requireUser(ctx);

    const template = await ctx.db
      .query("document_checklist_templates")
      .withIndex("by_country", (q) => q.eq("country", country))
      .first();
    if (!template) {
      throw new Error(`Template untuk negara "${country}" tidak ditemukan`);
    }

    const existing = await ctx.db
      .query("document_checklist_items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const { documents, preserved } = mergeTemplateForInstantiate(
      template.documents,
      existing?.documents ?? [],
    );
    const progress = computeProgress(documents);

    if (existing) {
      await ctx.db.patch(existing._id, {
        type: "country-template",
        country: template.country,
        documents,
        progress,
      });
      return {
        checklistId: existing._id,
        inserted: documents.length - preserved,
        preserved,
      };
    }

    const checklistId = await ctx.db.insert("document_checklist_items", {
      userId,
      type: "country-template",
      country: template.country,
      documents,
      progress: 0,
    });
    return {
      checklistId,
      inserted: documents.length,
      preserved: 0,
    };
  },
});
