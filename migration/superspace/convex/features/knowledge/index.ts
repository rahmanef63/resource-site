/**
 * Knowledge Feature - Convex Backend
 * 
 * The knowledge feature provides:
 * - Document storage via convex/features/docs/
 * - User profiles via convex/user/users.ts
 * - Workspace context via convex/features/knowledge/api/workspaceContext.ts
 * - AI context queries via convex/features/knowledge/api/knowledgeForAI.ts
 */

// Export workspace context API
export * from "./api/workspaceContext";
export * from "./api/schema";
export * from "./api/knowledgeForAI";

export const KNOWLEDGE_FEATURE_INFO = {
  id: 'knowledge',
  name: 'Knowledge',
  description: 'Centralized knowledge base with documents, articles, and AI-consumable data',
  subFeatures: ['profile', 'docs', 'articles', 'workspace-context'],
  convexDependencies: [
    'convex/features/docs/documents.ts',
    'convex/user/users.ts',
    'convex/features/knowledge/api/workspaceContext.ts',
    'convex/features/knowledge/api/knowledgeForAI.ts',
  ],
} as const;
