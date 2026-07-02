import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for Forms feature
 */
export function useForms(workspaceId: Id<"workspaces"> | null | undefined) {
  const forms = useQuery(
    api.features.forms.queries.getForms,
    workspaceId ? { workspaceId } : "skip"
  )

  const createForm = useMutation(api.features.forms.mutations.createForm)
  const updateForm = useMutation(api.features.forms.mutations.updateForm)
  const deleteForm = useMutation(api.features.forms.mutations.deleteForm)
  const submitForm = useMutation(api.features.forms.mutations.submitForm)

  return {
    isLoading: forms === undefined && workspaceId !== null && workspaceId !== undefined,
    forms: forms ?? [],
    createForm,
    updateForm,
    deleteForm,
    submitForm,
  }
}

export function useFormSubmissions(
  workspaceId: Id<"workspaces"> | null | undefined,
  formId: Id<"forms"> | null | undefined
) {
  const submissions = useQuery(
    api.features.forms.queries.getSubmissions,
    workspaceId && formId ? { workspaceId, formId } : "skip"
  )

  return {
    isLoading: submissions === undefined && !!workspaceId && !!formId,
    submissions: submissions ?? [],
  }
}
