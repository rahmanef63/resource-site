/**
 * Owner Analytics Schema
 *
 * READ-ONLY aggregator feature — no schema tables of its own. Queries read
 * cross-feature data from `sales`, `cashFlowForecasts`, and `guestBookings`.
 *
 * Exposed as an empty table map to satisfy the conventional aggregator
 * export pattern; main `convex/schema.ts` does not need to import this.
 */
export const ownerAnalyticsTables = {}

export default ownerAnalyticsTables
