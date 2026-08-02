"use client"

import { useQuery } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { useAIStore } from "../stores"
import type { KnowledgeSourceType } from "../types"

/**
 * Hook to fetch and format knowledge context for AI
 * Returns formatted context string from selected knowledge sources
 * 
 * Now includes:
 * - Documents from the Knowledge feature (documents table)
 * - Aggregated knowledge from child workspaces (for Main Workspace)
 */
export function useAIKnowledgeContext() {
  const { workspaceId, isMainWorkspace, mainWorkspace } = useWorkspaceContext()
  const selectedKnowledgeSources = useAIStore((s) => s.selectedKnowledgeSources)
  const globalMode = useAIStore((s) => s.globalMode)
  // New: Option to include child workspace knowledge (enabled by default for Main Workspace)
  const includeChildWorkspaces = useAIStore((s) => (s as any).includeChildWorkspaces ?? isMainWorkspace)

  // Fetch document counts for UI
  const documentCounts = useQuery(
    api.features.ai.queries.getKnowledgeDocumentCounts,
    workspaceId && !globalMode ? { workspaceId } : "skip"
  )

  // Fetch knowledge documents based on selected sources (from knowledgeBaseDocuments)
  const knowledgeDocs = useQuery(
    api.features.ai.queries.getKnowledgeBySourceTypes,
    workspaceId && !globalMode && selectedKnowledgeSources.length > 0
      ? {
          workspaceId,
          sourceTypes: selectedKnowledgeSources,
          limit: 20, // Limit to avoid context overflow
        }
      : "skip"
  )

  // NEW: Fetch documents from Knowledge feature (documents table)
  // This is the primary source for user-created knowledge
  const knowledgeFeatureDocs = useQuery(
    api["features/knowledge/api/knowledgeForAI"]?.getFullKnowledgeContext,
    workspaceId && !globalMode
      ? {
          workspaceId,
          includeDocuments: true,
          includeWorkspaceContext: true,
          documentLimit: 10,
        }
      : "skip"
  )

  // NEW: Fetch aggregated knowledge from child workspaces (for Main Workspace)
  const aggregatedKnowledge = useQuery(
    api.features.ai.queries.getAggregatedKnowledgeContext,
    workspaceId && isMainWorkspace && includeChildWorkspaces && !globalMode
      ? {
          mainWorkspaceId: workspaceId,
          includeChildren: true,
          documentLimit: 30,
        }
      : "skip"
  )

  // NEW: Fetch list of knowledge-sharing children (for UI display)
  const knowledgeSharingChildren = useQuery(
    api.features.ai.queries.getKnowledgeSharingChildren,
    workspaceId && isMainWorkspace && !globalMode
      ? { parentWorkspaceId: workspaceId }
      : "skip"
  )

  // Format knowledge documents into context string
  const formatKnowledgeContext = (): string | undefined => {
    const sections: string[] = []

    // 1. Add aggregated knowledge from child workspaces (for Main Workspace)
    if (isMainWorkspace && includeChildWorkspaces && aggregatedKnowledge?.formattedContext) {
      sections.push(aggregatedKnowledge.formattedContext)
    }

    // 2. Add Knowledge feature context (workspace context + documents)
    if (knowledgeFeatureDocs?.formattedContext) {
      sections.push(knowledgeFeatureDocs.formattedContext)
    }

    // 3. Add legacy knowledgeBaseDocuments if any
    if (knowledgeDocs && knowledgeDocs.length > 0) {
      // Group documents by source type
      const groupedDocs = knowledgeDocs.reduce((acc: any, doc: any) => {
        if (!acc[doc.sourceType]) {
          acc[doc.sourceType] = []
        }
        acc[doc.sourceType].push(doc)
        return acc
      }, {} as Record<string, typeof knowledgeDocs>)

      // Format each section
      for (const [sourceType, docs] of Object.entries(groupedDocs) as Array<[string, any[]]>) {
        const sectionTitle = formatSourceTypeTitle(sourceType as KnowledgeSourceType)
        const docContent = docs
          .map((doc: any) => `### ${doc.title}\n${doc.content}`)
          .join("\n\n")
        
        sections.push(`## ${sectionTitle}\n\n${docContent}`)
      }
    }

    return sections.length > 0 ? sections.join("\n\n---\n\n") : undefined
  }

  // Calculate combined document count
  const totalDocs = documentCounts
    ? Object.values(documentCounts).reduce((a: number, b: any) => a + (b as number), 0)
    : 0
  const knowledgeFeatureDocCount = knowledgeFeatureDocs?.documents?.length ?? 0
  const aggregatedDocCount = aggregatedKnowledge?.totalDocuments ?? 0
  const combinedCount = totalDocs + knowledgeFeatureDocCount + (isMainWorkspace ? aggregatedDocCount : 0)

  return {
    knowledgeContext: formatKnowledgeContext(),
    documentCounts: documentCounts as Record<KnowledgeSourceType, number> | undefined,
    isLoading: (knowledgeDocs === undefined && selectedKnowledgeSources.length > 0) || 
               knowledgeFeatureDocs === undefined ||
               (isMainWorkspace && includeChildWorkspaces && aggregatedKnowledge === undefined),
    hasKnowledge: Boolean(knowledgeDocs && knowledgeDocs.length > 0) || 
                  Boolean(knowledgeFeatureDocs?.formattedContext) ||
                  Boolean(aggregatedKnowledge?.formattedContext),
    // Expose workspace context status
    hasWorkspaceContext: Boolean(knowledgeFeatureDocs?.workspaceContext),
    knowledgeFeatureDocCount,
    combinedDocumentCount: combinedCount,
    // NEW: Main Workspace specific properties
    isMainWorkspace,
    includeChildWorkspaces,
    knowledgeSharingChildren: knowledgeSharingChildren ?? [],
    aggregatedKnowledge: aggregatedKnowledge ?? null,
    childWorkspaceCount: aggregatedKnowledge?.workspaces?.length ?? 0,
  }
}

function formatSourceTypeTitle(sourceType: KnowledgeSourceType): string {
  const titles: Record<KnowledgeSourceType, string> = {
    wiki: "Wiki / Knowledge Base",
    posts: "Blog Posts",
    portfolio: "Portfolio",
    services: "Services",
    products: "Products",
    pages: "CMS Pages",
    custom: "Custom Documents",
  }
  return titles[sourceType] || sourceType
}
