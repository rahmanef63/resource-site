"use client"

import type { ReactNode } from "react"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { NavContextProvider } from "../hooks/NavContextProvider"

/**
 * NavContextMount — bridge that reads workspaceId from the existing
 * WorkspaceProvider (legacy) and feeds it to NavContextProvider.
 *
 * Mount inside WorkspaceProvider so deeper components can `useNavContextSafe`
 * or `useNavContextRequired` to read the atomic (workspace × menuSet) pair.
 */
export function NavContextMount({ children }: { children: ReactNode }) {
  const { workspaceId } = useWorkspaceContext()
  return <NavContextProvider workspaceId={workspaceId}>{children}</NavContextProvider>
}
