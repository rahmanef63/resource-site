import { query } from "../../_generated/server";
import { v } from "convex/values";

const WINDOW_DAYS = 30;
const WINDOW_MS = WINDOW_DAYS * 24 * 60 * 60 * 1000;

/**
 * Aggregate stats for one slice across the last 30 days.
 *
 * Returns:
 *  - total_adopts        : count of "adopt" events
 *  - audit_pass_rate     : pass / (pass + fail) ∈ [0, 1], or null when no audits
 *  - distinct_consumers  : number of unique consumer_hash values seen
 *  - drift_events        : count of "drift" events
 */
export const getSliceStats = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const since = Date.now() - WINDOW_MS;

    const events = await ctx.db
      .query("telemetry_events")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .filter((q) => q.gte(q.field("received_at"), since))
      .take(10_000);

    let total_adopts = 0;
    let audit_pass = 0;
    let audit_fail = 0;
    let drift_events = 0;
    const consumers = new Set<string>();

    for (const e of events) {
      consumers.add(e.consumer_hash);
      switch (e.event_type) {
        case "adopt":
          total_adopts += 1;
          break;
        case "audit_pass":
          audit_pass += 1;
          break;
        case "audit_fail":
          audit_fail += 1;
          break;
        case "drift":
          drift_events += 1;
          break;
        default:
          break;
      }
    }

    const auditTotal = audit_pass + audit_fail;
    return {
      slug,
      window_days: WINDOW_DAYS,
      total_adopts,
      audit_pass_rate: auditTotal === 0 ? null : audit_pass / auditTotal,
      distinct_consumers: consumers.size,
      drift_events,
    };
  },
});
