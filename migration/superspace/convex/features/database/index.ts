/**
 * Database feature handlers
 *
 * This mirrors the convention used by other features so the generated API
 * exposes `features/database/queries` and `features/database/mutations`.
 * 
 * Structure:
 * - queries.ts: Main queries file (standard + re-exports from queries/ folder)
 * - mutations.ts: Main mutations file (standard + re-exports from mutations/ folder)
 * - queries/: Universal database queries
 * - mutations/: Universal database mutations
 */

export * as queries from "./queries";
export * as mutations from "./mutations";
