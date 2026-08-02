"use client"

import * as React from "react"
import { useNavContext, type NavContextValue } from "./useNavContext"
import type { Id } from "@/convex/_generated/dataModel"

const NavContext = React.createContext<NavContextValue | null>(null)

interface NavContextProviderProps {
  workspaceId: Id<"workspaces"> | null | undefined
  children: React.ReactNode
}

/**
 * NavContextProvider — wraps useNavContext into React Context so deep tree
 * consumers don't re-subscribe to Convex queries 3× per render.
 *
 * Mount once near the top of the dashboard tree (P5 wires this into
 * app/dashboard/layout.tsx). Reads from existing WorkspaceProvider's
 * workspaceId — does NOT replace it.
 */
export function NavContextProvider({
  workspaceId,
  children,
}: NavContextProviderProps) {
  const value = useNavContext(workspaceId)
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

/**
 * useNavContextSafe — read from NavContextProvider. Returns null if no provider
 * mounted (caller can fall back to useNavContext() with explicit workspaceId).
 */
export function useNavContextSafe(): NavContextValue | null {
  return React.useContext(NavContext)
}

/**
 * useNavContextRequired — read from NavContextProvider. Throws if no provider.
 * Use this inside slice components that mount under the provider.
 */
export function useNavContextRequired(): NavContextValue {
  const ctx = React.useContext(NavContext)
  if (!ctx) {
    throw new Error(
      "useNavContextRequired must be used inside <NavContextProvider>. " +
        "Mount the provider near the top of your dashboard tree (typically " +
        "app/dashboard/layout.tsx).",
    )
  }
  return ctx
}
