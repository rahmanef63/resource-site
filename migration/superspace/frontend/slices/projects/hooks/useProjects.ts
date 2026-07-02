"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

export function useProjects(workspaceId: Id<"workspaces"> | null | undefined) {
  const projects = useQuery(
    api.features.projects.queries.getWorkspaceProjects,
    workspaceId ? { workspaceId } : "skip",
  )

  const createProject = useMutation(api.features.projects.mutations.createProject)
  const updateProject = useMutation(api.features.projects.mutations.updateProject)

  return {
    isLoading: projects === undefined && !!workspaceId,
    projects: projects ?? [],
    createProject,
    updateProject,
  }
}
