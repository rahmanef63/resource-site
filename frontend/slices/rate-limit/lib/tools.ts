// Agentic tool collection (Tier A* — ADMIN/INFRA). check is a read; reset is
// destructive state surgery and must be bound to an admin-gated
// implementation (this slice is rr's own live backend limiter — be careful).

import { defineToolCollection, obj, str } from "@/shared/agentic";

export type RateLimitCtx = {
  check: (key: string) => Promise<{ ok: boolean; remaining: number; resetAt: number }>;
  /** Admin-gated: clears the counter for a key. */
  reset: (key: string) => Promise<string>;
};

export const rateLimitTools = defineToolCollection<RateLimitCtx>({
  namespace: "rate-limit",
  tools: [
    {
      name: "check",
      description: "Check the limiter state for a key (ok / remaining / resetAt).",
      parameters: obj({ "key!": str("rate-limit key, e.g. login:1.2.3.4") }),
      run: async (ctx, a) => {
        const r = await ctx.check(a.key as string);
        return `ok=${r.ok} remaining=${r.remaining} resetAt=${new Date(r.resetAt).toISOString()}`;
      },
    },
    {
      name: "reset",
      description: "Reset the limiter for a key (admin-gated; affects the live limiter).",
      parameters: obj({ "key!": str("rate-limit key") }),
      run: (ctx, a) => ctx.reset(a.key as string),
    },
  ],
});
