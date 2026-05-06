"use client"

import { useConvexAuth } from "convex/react"
import { useAuth } from "@/frontend/shared/foundation/auth"

export function useAuthed() {
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth()
  const { isSignedIn, isLoaded } = useAuth()

  // Wait for auth to fully load first
  // Only show "not authenticated" after auth has loaded
  const isLoading = !isLoaded || convexLoading

  // Backend-facing auth should only trust Convex auth.
  // auth sign-in can be true before Convex has a usable session token.
  const isConvexAuthenticated = Boolean(isAuthenticated)
  const isAuthSignedIn = Boolean(isSignedIn)
  const isAuthed = isLoading ? false : isConvexAuthenticated

  return {
    isAuthed,
    isLoading,
    isAuthenticated: isConvexAuthenticated,
    isSignedIn: isAuthSignedIn,
    isConvexAuthenticated,
    isAuthSignedIn,
  }
}
