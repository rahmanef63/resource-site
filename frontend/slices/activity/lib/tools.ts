// Agentic tool collection (READ-ONLY). Ctx = injectable bindings over the
// consumer's activity queries (writes stay with the consumer's ingest path).

import { defineToolCollection, noArgs, num, obj, str } from "@/shared/agentic";
import type { ActivityRow } from "./types";

export type ActivityToolsCtx = {
  list: (q: { category?: string; since?: number; limit?: number }) => Promise<ActivityRow[]>;
  stats: () => Promise<string>;
};

export const activityTools = defineToolCollection<ActivityToolsCtx>({
  namespace: "activity",
  instructions: "Read-only activity feed. Use list for recent events (paginate with a limit), stats for aggregate counts.",
  tools: [
    {
      name: "list",
      description: "List activity rows, newest first (filter by category/since-epoch-ms).",
      parameters: obj({ category: str("filter: category"), since: num("filter: epoch-ms"), limit: num("max rows (default 50)") }),
      run: async (ctx, a) => {
        const rows = await ctx.list({
          category: a.category as string | undefined,
          since: a.since as number | undefined,
          limit: (a.limit as number | undefined) ?? 50,
        });
        return rows.map((r) => `${new Date(r.occurredAt).toISOString()} [${r.category}] ${r.title}`).join("\n") || "no activity";
      },
    },
    {
      name: "stats",
      description: "Read the aggregate activity stats.",
      parameters: noArgs,
      run: (ctx) => ctx.stats(),
    },
  ],
});
