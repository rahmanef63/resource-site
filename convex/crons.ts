/**
 * Cron registry for the rr live backend. Before this file existed, no
 * cleanup ran at all: rateLimits rows accumulated forever and the
 * subscribe-attempt throttle tables grew unbounded.
 *
 * Each prune walks at most 1000 rows per run to bound per-invocation cost;
 * the cadence guarantees steady-state drain even under flood.
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "rate-limit: prune expired",
  { minutes: 5 },
  internal.features.rate_limit.mutation._pruneExpired,
  {},
);

crons.interval(
  "newsletter: prune subscribe attempts",
  { hours: 24 },
  internal.features.newsletter.mutation._pruneAttempts,
  {},
);

crons.interval(
  "subscribers: prune subscribe attempts",
  { hours: 24 },
  internal.features.subscribers.mutation._pruneAttempts,
  {},
);

export default crons;
