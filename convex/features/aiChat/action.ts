"use node";

/**
 * ai-chat backend — real LLM call via the Vercel `ai` SDK + @ai-sdk/anthropic.
 *
 * Key-guarded: ANTHROPIC_API_KEY is set by the site owner on the Convex
 * deployment at deploy time. When it is NOT set the action does NOT throw —
 * it returns `{ ok: false, notice }` so the chat UI degrades gracefully and
 * the build / prerender never depends on the key being present.
 *
 * System prompt is pulled from the agency's existing `agencyAiConfig`
 * singleton so the public assistant speaks in the studio's voice.
 */

import { action } from "../../_generated/server";
import { api } from "../../_generated/api";
import { v } from "convex/values";

const MODEL = "claude-3-5-haiku-latest";

export const chat = action({
  args: {
    prompt: v.string(),
    history: v.optional(
      v.array(
        v.object({
          role: v.union(v.literal("user"), v.literal("assistant")),
          content: v.string(),
        }),
      ),
    ),
  },
  handler: async (
    ctx,
    { prompt, history },
  ): Promise<{ ok: boolean; text?: string; notice?: string }> => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return {
        ok: false,
        notice:
          "AI chat is not configured yet. The site owner must set ANTHROPIC_API_KEY on the Convex deployment to enable live replies.",
      };
    }

    const cfg = await ctx.runQuery(api.aiConfig.get, {});
    const system =
      (cfg && "systemPrompt" in cfg ? (cfg.systemPrompt as string) : "") ||
      "You are a helpful assistant for a creative studio website.";

    try {
      const { generateText } = await import("ai");
      const { createAnthropic } = await import("@ai-sdk/anthropic");
      const anthropic = createAnthropic({ apiKey: key });

      const messages = [
        ...(history ?? []),
        { role: "user" as const, content: prompt },
      ];

      const { text } = await generateText({
        model: anthropic(MODEL),
        system,
        messages,
        maxTokens: 600,
      });

      return { ok: true, text };
    } catch (e) {
      return {
        ok: false,
        notice: `AI request failed: ${(e as Error).message}`,
      };
    }
  },
});
