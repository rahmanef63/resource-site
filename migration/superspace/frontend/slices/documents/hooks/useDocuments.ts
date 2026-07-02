"use client"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

export function useDocuments(workspaceId: Id<"workspaces"> | null | undefined) {
  const documents = useQuery(
    api.features.docs.documents.list,
    workspaceId ? { workspaceId } : "skip"
  )

  const createDocument = useMutation(api.features.docs.documents.create)
  const updateDocument = useMutation(api.features.docs.documents.update)
  const deleteDocument = useMutation(api.features.docs.documents.deleteDocument)

  return {
    isLoading: documents === undefined && !!workspaceId,
    documents: documents ?? [],
    createDocument,
    updateDocument,
    deleteDocument,
  }
}

export function useDocument(documentId: Id<"documents"> | undefined) {
  return useQuery(
    api.features.docs.documents.get,
    documentId ? { id: documentId } : "skip"
  )
}
