/**
 * ============================================================================
 * EXAMPLE FEATURE - index.ts (Convex)
 * ============================================================================
 * 
 * Feature Index - Barrel Exports
 * 
 * This file re-exports all public APIs from this feature.
 * It makes imports cleaner:
 * 
 *   // Instead of:
 *   import { getItems } from 'convex/features/example/queries'
 *   import { createItem } from 'convex/features/example/mutations'
 *   
 *   // You can do:
 *   import { getItems, createItem } from 'convex/features/example'
 */

// Re-export queries
export * from "./queries"

// Re-export mutations  
export * from "./mutations"

// Re-export schema (for composition in main schema.ts)
export { exampleTables } from "./schema"
