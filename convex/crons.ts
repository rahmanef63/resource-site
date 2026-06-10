/**
 * Cron registry for rr's OWN backend. rr deploys only the admin rate
 * limiter (see schema.ts), so the only scheduled job is its prune.
 *
 * Copy-source slices that ship their own prune mutations (newsletter,
 * subscribers — `_pruneAttempts` + `by_attemptedAt` index) are wired into
 * the CONSUMER's crons.ts when they download those slices, not here.
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

export default crons;
