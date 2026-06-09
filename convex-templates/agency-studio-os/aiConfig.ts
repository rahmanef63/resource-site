import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Singleton AI assistant config. Defaults mirror shared/ai-config-seed.ts.
const DEFAULTS = {
  model: "claude-sonnet-4-7",
  tone: "Field-notes",
  temperature: 0.55,
  systemPrompt:
    "You are the editorial assistant for an Indonesian B2B design studio. Voice: studio principal — observational, no jargon, mixes ID + EN naturally. Always frame advice as trade-offs (not best practices). When drafting client-facing copy: lead with the outcome, end with one open question. Reject hype, marketing fluff, em-dash overuse.",
  playgroundDraft:
    "Tulis hook untuk artikel: 'Brand system adalah kontrak operasional, bukan deck.'",
  playgroundResponse: "",
} as const;

export const get = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("agencyAiConfig").first();
    return row ?? { ...DEFAULTS };
  },
});

const FIELDS = {
  model: v.optional(v.string()),
  tone: v.optional(v.string()),
  temperature: v.optional(v.number()),
  systemPrompt: v.optional(v.string()),
  playgroundDraft: v.optional(v.string()),
  playgroundResponse: v.optional(v.string()),
};

export const update = mutation({
  args: FIELDS,
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(args)) if (val !== undefined) patch[k] = val;
    const existing = await ctx.db.query("agencyAiConfig").first();
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return ctx.db.insert("agencyAiConfig", { ...DEFAULTS, ...patch });
  },
});

export const reset = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("agencyAiConfig").first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...DEFAULTS });
      return existing._id;
    }
    return ctx.db.insert("agencyAiConfig", { ...DEFAULTS });
  },
});
