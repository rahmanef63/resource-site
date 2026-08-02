"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { useAuthed } from "@/frontend/shared/foundation"
import { api } from "@/convex/_generated/api"
import {
  getWorkspaceOnboardingHref,
  isWorkspaceOnboardingRoute,
} from "@/frontend/shared/ui/layout/dashboard/dashboard-routes"

export function OnboardingGuard() {
  const { isAuthed, isLoading } = useAuthed()
  const userWorkspaces = useQuery(api.workspace.workspaces.getUserWorkspaces)
  const backfillMemberships = useMutation(api.workspace.workspaces.backfillMembershipsForCurrentUser as any)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Track backfill state
  const [backfillState, setBackfillState] = useState<'idle' | 'running' | 'done-found' | 'done-empty'>('idle')
  const previousWorkspaceCountRef = useRef<number | null>(null)

  const workspacesLoaded = userWorkspaces !== undefined
  const workspaceCount = Array.isArray(userWorkspaces) ? userWorkspaces.length : 0
  const hasWorkspaces = Array.isArray(userWorkspaces) && userWorkspaces.length > 0

  useEffect(() => {
    // Wait for auth and data to load
    if (isLoading) return
    if (!workspacesLoaded) return
    if (!isAuthed) return

    const previousWorkspaceCount = previousWorkspaceCountRef.current
    const transitionedToZero =
      previousWorkspaceCount !== null &&
      previousWorkspaceCount > 0 &&
      workspaceCount === 0
    
    // Don't redirect if already on workspace page or just onboarded
    const justOnboarded = searchParams?.get("onboarded") === "1"
    if (justOnboarded) {
      previousWorkspaceCountRef.current = workspaceCount
      return
    }
    if (isWorkspaceOnboardingRoute(pathname)) {
      previousWorkspaceCountRef.current = workspaceCount
      return
    }
    
    // If user HAS workspaces, we're good - no action needed
    if (hasWorkspaces) {
      // Reset state for next time
      if (backfillState !== 'idle') setBackfillState('idle')
      previousWorkspaceCountRef.current = workspaceCount
      return
    }

    if (transitionedToZero) {
      if (backfillState !== 'done-empty') setBackfillState('done-empty')
      router.replace(getWorkspaceOnboardingHref())
      previousWorkspaceCountRef.current = workspaceCount
      return
    }
    
    // User has NO workspaces - handle backfill flow
    switch (backfillState) {
      case 'idle':
        // First time seeing no workspaces - try backfill
        setBackfillState('running')
        backfillMemberships({})
          .then((result: any) => {
            if (result && result.found > 0) {
              setBackfillState('done-found')
            } else {
              setBackfillState('done-empty')
            }
          })
          .catch((err) => {
            console.error('OnboardingGuard:backfillMemberships error', err)
            setBackfillState('done-empty')
          })
        break
        
      case 'running':
        // Backfill in progress, wait
        break
        
      case 'done-found':
        // Backfill found workspaces but query hasn't updated yet - wait
        // The query subscription will update and hasWorkspaces will become true
        break
        
      case 'done-empty':
        // Backfill complete and confirmed no workspaces - redirect
        router.replace(getWorkspaceOnboardingHref())
        break
    }
    previousWorkspaceCountRef.current = workspaceCount
  }, [backfillMemberships, backfillState, hasWorkspaces, isAuthed, isLoading, pathname, router, searchParams, workspaceCount, workspacesLoaded])

  return null
}
