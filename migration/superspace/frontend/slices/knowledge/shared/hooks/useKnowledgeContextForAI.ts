import { useQuery } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import type { Id } from "@convex/_generated/dataModel";

/**
 * Hook to get knowledge context for AI
 *
 * This hook provides a single optimized query to fetch all knowledge
 * context needed for AI conversations, including:
 * - Workspace context (team, project, goals, etc.)
 * - Documents and articles
 * - Formatted context string ready for AI consumption
 *
 * Best Practices for AI Knowledge Integration:
 * 1. Use getFullKnowledgeContext for initial context loading
 * 2. Limit document count to avoid token overflow (default: 10)
 * 3. Cache results - context doesn't change frequently
 * 4. Only fetch when starting a new conversation or explicitly requested
 */
export function useKnowledgeContextForAI(
  workspaceId: Id<"workspaces"> | null | undefined,
  options?: {
    includeDocuments?: boolean;
    includeWorkspaceContext?: boolean;
    documentLimit?: number;
    enabled?: boolean;
  }
) {
  const {
    includeDocuments = true,
    includeWorkspaceContext = true,
    documentLimit = 10,
    enabled = true,
  } = options ?? {};

  const result = useQuery(
    api["features/knowledge/api/knowledgeForAI"].getFullKnowledgeContext,
    workspaceId && enabled
      ? {
          workspaceId,
          includeDocuments,
          includeWorkspaceContext,
          documentLimit,
        }
      : "skip"
  );

  return {
    context: result,
    formattedContext: result?.formattedContext,
    isLoading: result === undefined && enabled,
    hasContext: Boolean(result?.formattedContext),
    documentCount: result?.documents?.length ?? 0,
    hasWorkspaceContext: Boolean(
      result?.workspaceContext?.teamOverview ||
      result?.workspaceContext?.projectContext
    ),
  };
}

/**
 * Hook to get document counts for UI badges
 */
export function useKnowledgeDocumentCounts(
  workspaceId: Id<"workspaces"> | null | undefined
) {
  return useQuery(
    api["features/knowledge/api/knowledgeForAI"].getDocumentCounts,
    workspaceId ? { workspaceId } : undefined
  );
}

/**
 * Hook to get documents for AI context with category filter
 */
export function useDocumentsForAI(
  workspaceId: Id<"workspaces"> | null | undefined,
  options?: {
    category?: "article" | "document";
    limit?: number;
  }
) {
  const { category, limit = 20 } = options ?? {};

  return useQuery(
    api["features/knowledge/api/knowledgeForAI"].getDocumentsForAIContext,
    workspaceId
      ? {
          workspaceId,
          category,
          limit,
        }
      : "skip"
  );
}
