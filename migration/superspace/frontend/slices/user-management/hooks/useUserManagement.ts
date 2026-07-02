"use client"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

export function useWorkspaceTeams(workspaceId: Id<"workspaces"> | null | undefined) {
  const teams = useQuery(
    api.features.userManagement.api.queries.getWorkspaceTeams,
    workspaceId ? { workspaceId } : "skip"
  )

  const createTeam = useMutation(api.features.userManagement.api.mutations.createTeam)
  const addTeamMember = useMutation(api.features.userManagement.api.mutations.addTeamMember)
  const removeTeamMember = useMutation(api.features.userManagement.api.mutations.removeTeamMember)

  return {
    isLoading: teams === undefined && !!workspaceId,
    teams: teams ?? [],
    createTeam,
    addTeamMember,
    removeTeamMember,
  }
}

export function useUserWorkspaceMatrix(workspaceId: Id<"workspaces"> | null | undefined) {
  return useQuery(
    api.features.userManagement.api.queries.getUserWorkspaceMatrix,
    workspaceId ? { workspaceId } : "skip"
  )
}

export function useTeamMembers(teamId: Id<"userTeams"> | undefined) {
  return useQuery(
    api.features.userManagement.api.queries.getTeamMembers,
    teamId ? { teamId } : "skip"
  )
}
