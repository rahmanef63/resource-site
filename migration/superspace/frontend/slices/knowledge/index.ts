/**
 * Knowledge Feature
 * 
 * Centralized knowledge base with documents, articles, and AI-consumable data.
 * This feature consolidates:
 * - Documents (regular notes, drafts)
 * - Articles (knowledge base for AI)
 * - Profile data (user context for AI)
 * - Workspace context (team context for AI)
 */

export { default as config } from './config';

// Re-export shared types and components
export * from './shared';

// Re-export sub-features
export * from './features/profile';
export type { ArticleMetadata } from './features/articles';
export * from './features/workspace-context';
