// Agentic tool collection (Tier A* — ADMIN). The slice is contract-first;
// the ctx is the injectable tracking transport (bind to your event SDK /
// Convex functions). Query/funnel reads must be server-gated (analytics are
// sensitive); track is the standard client emit.

import { arr, defineToolCollection, num, obj, str } from "@/shared/agentic";

export type EventTrackingCtx = {
  /** Emit one event; resolves to a short ack. */
  track: (name: string, props?: Record<string, unknown>) => Promise<string>;
  /** Server-gated query over recorded events. */
  query: (q: { name?: string; since?: number; limit?: number }) => Promise<string>;
  /** Server-gated funnel: conversion across ordered steps. */
  funnel: (steps: string[]) => Promise<string>;
};

export const eventTrackingTools = defineToolCollection<EventTrackingCtx>({
  namespace: "event-tracking",
  instructions: "Analytics events. track emits one event; query/funnel are server-gated reads. Bound queries and treat the data as sensitive.",
  tools: [
    {
      name: "track",
      description: "Record an analytics event (name + optional JSON props).",
      parameters: obj({ "name!": str("event name"), props: str("JSON object of properties") }),
      run: (ctx, a) => {
        let props: Record<string, unknown> | undefined;
        if (a.props) props = JSON.parse(a.props as string) as Record<string, unknown>;
        return ctx.track(a.name as string, props);
      },
    },
    {
      name: "query",
      description: "Query recorded events (filter by name/since-epoch-ms).",
      parameters: obj({ name: str("filter: event name"), since: num("filter: epoch-ms"), limit: num("max rows") }),
      run: (ctx, a) =>
        ctx.query({ name: a.name as string | undefined, since: a.since as number | undefined, limit: a.limit as number | undefined }),
    },
    {
      name: "funnel",
      description: "Compute step-to-step conversion for an ordered list of event names.",
      parameters: obj({ "steps!": arr("ordered funnel steps", str("event name")) }),
      run: (ctx, a) => ctx.funnel(a.steps as string[]),
    },
  ],
});
