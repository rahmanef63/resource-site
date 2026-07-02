"use client"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

export function useKnowledge(workspaceId: Id<"workspaces"> | null | undefined) {
  const context = useQuery(
    api.features.knowledge.api.workspaceContext.getWorkspaceContext,
    workspaceId ? { workspaceId } : "skip"
  )

  const updateContext = useMutation(
    api.features.knowledge.api.workspaceContext.updateWorkspaceContext
  )

  return {
    isLoading: context === undefined && !!workspaceId,
    context,
    updateContext,
  }
}

export function useKnowledgeForAI(workspaceId: Id<"workspaces"> | null | undefined) {
  return useQuery(
    api.features.knowledge.api.knowledgeForAI.getDocumentsForAIContext,
    workspaceId ? { workspaceId } : "skip"
  )
}
