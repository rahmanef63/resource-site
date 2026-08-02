"use client"

import { useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { Id } from "@/convex/_generated/dataModel"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import {
  AUTHENTICATED_DASHBOARD_BASE,
  getDashboardFeatureHref,
  getWorkspaceOnboardingHref,
} from "@/frontend/shared/ui/layout/dashboard/dashboard-routes"

export type PostWorkspaceDeleteReason =
  | "deleted-non-current-workspace"
  | "deleted-current-workspace"
  | "last-workspace"
  | "no-current-workspace"

export interface ResolvePostWorkspaceDeleteRouteOptions {
  deletedWorkspaceId: string
  currentWorkspaceId?: string | null
  remainingWorkspaceIds: string[]
  currentPathname?: string | null
}

export interface PostWorkspaceDeleteResolution {
  nextWorkspaceId: string | null
  redirectTo: string | null
  reason: PostWorkspaceDeleteReason
}

export function resolvePostWorkspaceDeleteRoute({
  deletedWorkspaceId,
  currentWorkspaceId,
  remainingWorkspaceIds,
}: ResolvePostWorkspaceDeleteRouteOptions): PostWorkspaceDeleteResolution {
  const remaining = remainingWorkspaceIds.filter(
    (workspaceId) => String(workspaceId) !== String(deletedWorkspaceId),
  )

  if (remaining.length === 0) {
    return {
      nextWorkspaceId: null,
      redirectTo: getWorkspaceOnboardingHref(),
      reason: "last-workspace",
    }
  }

  const nextWorkspaceId = remaining[0] ?? null

  if (!currentWorkspaceId) {
    return {
      nextWorkspaceId,
      redirectTo: getDashboardFeatureHref(AUTHENTICATED_DASHBOARD_BASE, "overview"),
      reason: "no-current-workspace",
    }
  }

  if (String(currentWorkspaceId) !== String(deletedWorkspaceId)) {
    return {
      nextWorkspaceId: currentWorkspaceId,
      redirectTo: null,
      reason: "deleted-non-current-workspace",
    }
  }

  return {
    nextWorkspaceId,
    redirectTo: getDashboardFeatureHref(AUTHENTICATED_DASHBOARD_BASE, "overview"),
    reason: "deleted-current-workspace",
  }
}

export function usePostWorkspaceDeleteNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { workspaceId, setWorkspaceId, workspaces } = useWorkspaceContext()

  return useCallback((deletedWorkspaceId: Id<"workspaces">) => {
    const remainingWorkspaceIds = Array.isArray(workspaces)
      ? workspaces.map((workspace) => workspace._id)
      : []

    const resolution = resolvePostWorkspaceDeleteRoute({
      deletedWorkspaceId,
      currentWorkspaceId: workspaceId,
      remainingWorkspaceIds,
      currentPathname: pathname,
    })

    setWorkspaceId(
      resolution.nextWorkspaceId
        ? (resolution.nextWorkspaceId as Id<"workspaces">)
        : null,
    )

    if (resolution.redirectTo) {
      router.replace(resolution.redirectTo)
    }

    return resolution
  }, [pathname, router, setWorkspaceId, workspaceId, workspaces])
}
