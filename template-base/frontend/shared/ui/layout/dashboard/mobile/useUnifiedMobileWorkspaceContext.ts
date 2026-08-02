"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useUnifiedWorkspaceContext } from "@/frontend/shared/foundation/provider/UnifiedWorkspaceContext"

export type UnifiedMobileWorkspace = {
  _id: Id<"workspaces"> | string
  name: string
  type?: string
  color?: string
  icon?: string
  themePreset?: string
  parentWorkspaceId?: Id<"workspaces"> | string | null
}

export function useUnifiedMobileWorkspaceContext() {
  const unified = useUnifiedWorkspaceContext()

  return {
    isGuestMode: unified.isGuestMode,
    isLoading: unified.isLoading,
    workspaceId: unified.workspaceId as Id<"workspaces"> | string | null,
    setWorkspaceId: unified.setWorkspaceId as (id: Id<"workspaces"> | string | null) => void,
    currentWorkspace: unified.currentWorkspace as UnifiedMobileWorkspace | null,
    workspaces: (unified.workspaces ?? []) as UnifiedMobileWorkspace[],
    mainWorkspace: unified.mainWorkspace as UnifiedMobileWorkspace | null,
    workspacePath: (unified.workspacePath ?? []) as UnifiedMobileWorkspace[],
    childWorkspaces: (unified.childWorkspaces ?? []) as UnifiedMobileWorkspace[],
    siblingWorkspaces: (unified.siblingWorkspaces ?? []) as UnifiedMobileWorkspace[],
  }
}
