import { mutation } from "../../_generated/server";
import { v } from "convex/values";

const MAX_PAYLOAD_BYTES = 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_EVENTS = 60;
// sha256 hex = 64 chars; slug slugs are short. Caps stop storage-bloat DoS
// via giant strings (the per-hash rate limit alone doesn't bound row size,
// and a rotating hash sidesteps it entirely).
const MAX_HASH_CHARS = 64;
const MAX_SLUG_CHARS = 100;

/**
 * Record a single telemetry event.
 *
 * Hard rules:
 *  - `consumer_hash` MUST be sha256(consumerName + UTC day). The receiver
 *    does NOT verify the hash format — abuse is mitigated by rate-limit.
 *  - Payload is capped at 1 KB. Over the cap → reject with `payload_too_large`.
 *  - At most 60 events / hour per consumer_hash → reject with `rate_limited`.
 */
export const recordEvent = mutation({
  args: {
    slug: v.string(),
    event_type: v.union(
      v.literal("adopt"),
      v.literal("audit_pass"),
      v.literal("audit_fail"),
      v.literal("remove"),
      v.literal("drift"),
    ),
    consumer_hash: v.string(),
    payload: v.optional(v.string()),
  },
  handler: async (ctx, { slug, event_type, consumer_hash, payload }) => {
    if (payload && payload.length > MAX_PAYLOAD_BYTES) {
      throw new Error("payload_too_large");
    }
    if (consumer_hash.length > MAX_HASH_CHARS || slug.length > MAX_SLUG_CHARS) {
      throw new Error("field_too_large");
    }

    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;

    // Rate-limit: count events from this consumer in the last hour.
    const recent = await ctx.db
      .query("telemetry_events")
      .withIndex("by_consumer_hour", (q) =>
        q.eq("consumer_hash", consumer_hash).gte("received_at", windowStart),
      )
      .take(RATE_LIMIT_MAX_EVENTS + 1);

    if (recent.length >= RATE_LIMIT_MAX_EVENTS) {
      throw new Error("rate_limited");
    }

    await ctx.db.insert("telemetry_events", {
      slug,
      event_type,
      consumer_hash,
      payload,
      received_at: now,
    });

    return { ok: true as const };
  },
});
