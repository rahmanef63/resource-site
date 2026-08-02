"use node";

import { action } from "../../_generated/server";
import { api, internal } from "../../_generated/api";
import { v } from "convex/values";
import { buildSystemPrompt } from "./_seo_prompt";
import { safeParse } from "./_seo_helpers";
import type { AnthropicResponse, GenOut } from "./_seo_types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";

const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_PER_WINDOW = 60;

export const generate = action({
  args: {
    token: v.string(),
    table: v.union(
      v.literal("blogPosts"),
      v.literal("upcomingProjects"),
      v.literal("portfolioItems"),
    ),
    rowId: v.string(),
    title: v.string(),
    body: v.string(),
    category: v.optional(v.string()),
    hint: v.optional(v.string()),
    // v0.2.0 — consumer-injected persona block. Falls back to the generic
    // DEFAULT_PERSONA_CONTEXT when omitted so existing callers keep working.
    personaContext: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<GenOut> => {
    const me = (await ctx.runQuery(api.slices.auth.me, {
      token: args.token,
    })) as { email?: string; role?: string } | null | undefined;
    if (!me || me.role !== "admin") {
      throw new Error("Butuh akses admin");
    }
    const userEmail = (me.email ?? "unknown").toLowerCase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- internal fn refs under slices.seo only exist after consumer-side convex codegen; the in-repo _generated stub can't type them
    const seoInternal = (internal as any).slices.seo;

    const callsToday = (await ctx.runQuery(seoInternal.callsInWindow, {
      userEmail,
      windowMs: WINDOW_MS,
    })) as number;
    if (callsToday >= MAX_PER_WINDOW) {
      throw new Error(
        `SEO generator cap tercapai (${MAX_PER_WINDOW}/24 jam). Coba lagi besok.`,
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY belum di-set di Convex backend. " +
          "Tambahkan via Dokploy compose env atau `npx convex env set`.",
      );
    }

    const userMessage = [
      `Source table: ${args.table}`,
      args.category ? `Category: ${args.category}` : null,
      args.hint ? `Author hint: ${args.hint}` : null,
      "",
      `Title: ${args.title}`,
      "",
      "Body (truncated to 4000 chars):",
      args.body.slice(0, 4000),
    ]
      .filter(Boolean)
      .join("\n");

    let success = false;
    let inputTokens: number | undefined;
    let outputTokens: number | undefined;
    let errorMessage: string | undefined;

    try {
      const response = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 800,
          system: buildSystemPrompt(args.personaContext),
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Anthropic API ${response.status}: ${text.slice(0, 200)}`);
      }

      const body = (await response.json()) as AnthropicResponse;
      if (body.error) throw new Error(body.error.message ?? "Unknown LLM error");
      const raw = body.content?.[0]?.text ?? "";
      if (!raw) throw new Error("LLM returned empty content");

      const parsed = safeParse(raw);
      if (!parsed) throw new Error(`Invalid JSON from model: ${raw.slice(0, 200)}`);

      inputTokens = body.usage?.input_tokens;
      outputTokens = body.usage?.output_tokens;
      success = true;

      await ctx.runMutation(seoInternal._logGeneratorCall, {
        userEmail,
        table: args.table,
        rowId: args.rowId,
        titleLen: args.title.length,
        contentLen: args.body.length,
        inputTokens,
        outputTokens,
        success,
      });

      return parsed;
    } catch (e: unknown) {
      errorMessage = e instanceof Error ? e.message : String(e);
      await ctx.runMutation(seoInternal._logGeneratorCall, {
        userEmail,
        table: args.table,
        rowId: args.rowId,
        titleLen: args.title.length,
        contentLen: args.body.length,
        inputTokens,
        outputTokens,
        success: false,
        errorMessage,
      });
      throw e;
    }
  },
});

// Convenience: generate + persist in one round-trip from the admin form.
export const generateAndApply = action({
  args: {
    token: v.string(),
    table: v.union(
      v.literal("blogPosts"),
      v.literal("upcomingProjects"),
      v.literal("portfolioItems"),
    ),
    rowId: v.string(),
    title: v.string(),
    body: v.string(),
    category: v.optional(v.string()),
    hint: v.optional(v.string()),
    personaContext: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<GenOut> => {
    const out = (await ctx.runAction(
      api.slices.seo.generate,
      args,
    )) as GenOut;

    await ctx.runMutation(api.slices.seo.applyGenerated, {
      token: args.token,
      table: args.table,
      rowId: args.rowId,
      patch: {
        seoTitle: out.seoTitle,
        metaDescription: out.metaDescription,
        keywords: out.keywords,
        focusKeyphrase: out.focusKeyphrase,
        structuredType: out.structuredType,
      },
    });

    return out;
  },
});
