"use client"

import * as React from "react"
import type { Id } from "@/convex/_generated/dataModel"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import {
  useCommunicationsStore,
  useCommunicationWorkspaceId,
} from "../shared"

type CommunicationWorkspace = NonNullable<
  ReturnType<typeof useWorkspaceContext>["workspaces"]
>[number]

function findWorkspaceById(
  workspaces: CommunicationWorkspace[],
  workspaceId: string | null | undefined,
) {
  if (!workspaceId) {
    return null
  }

  return workspaces.find((workspace) => String(workspace._id) === workspaceId) ?? null
}

export function resolveActiveCommunicationWorkspace(
  workspaces: CommunicationWorkspace[] | undefined,
  communicationWorkspaceId: string | null | undefined,
  currentWorkspace: CommunicationWorkspace | null,
) {
  const availableWorkspaces = workspaces ?? []
  if (availableWorkspaces.length === 0) {
    return null
  }

  return (
    findWorkspaceById(availableWorkspaces, communicationWorkspaceId) ??
    findWorkspaceById(
      availableWorkspaces,
      currentWorkspace ? String(currentWorkspace._id) : null,
    ) ??
    availableWorkspaces[0]
  )
}

export function useCommunicationWorkspace() {
  const {
    workspaces,
    currentWorkspace,
    isLoading,
  } = useWorkspaceContext()
  const communicationWorkspaceId = useCommunicationWorkspaceId()
  const setCommunicationWorkspace = useCommunicationsStore(
    (state) => state.setCommunicationWorkspace,
  )

  const availableWorkspaces = workspaces ?? []
  const activeWorkspace = React.useMemo(
    () =>
      resolveActiveCommunicationWorkspace(
        availableWorkspaces,
        communicationWorkspaceId,
        currentWorkspace,
      ),
    [availableWorkspaces, communicationWorkspaceId, currentWorkspace],
  )

  const activeWorkspaceId = activeWorkspace?._id ?? null
  const activeWorkspaceIdString = activeWorkspace ? String(activeWorkspace._id) : null

  React.useEffect(() => {
    if (availableWorkspaces.length === 0) {
      if (communicationWorkspaceId !== null) {
        setCommunicationWorkspace(null)
      }
      return
    }

    if (
      activeWorkspaceIdString &&
      activeWorkspaceIdString !== communicationWorkspaceId
    ) {
      setCommunicationWorkspace(activeWorkspaceIdString)
    }
  }, [
    activeWorkspaceIdString,
    availableWorkspaces.length,
    communicationWorkspaceId,
    setCommunicationWorkspace,
  ])

  const setActiveWorkspaceId = React.useCallback(
    (workspaceId: Id<"workspaces"> | string | null | undefined) => {
      setCommunicationWorkspace(workspaceId ? String(workspaceId) : null)
    },
    [setCommunicationWorkspace],
  )

  return {
    workspaces: availableWorkspaces,
    activeWorkspace,
    activeWorkspaceId,
    activeWorkspaceIdString,
    communicationWorkspaceId,
    setActiveWorkspaceId,
    isLoading,
  }
}

export default useCommunicationWorkspace
