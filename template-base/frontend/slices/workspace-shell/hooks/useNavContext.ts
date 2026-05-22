"use client"

import { useCallback, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Doc, Id } from "@/convex/_generated/dataModel"

export type NavContextSource = "user" | "workspace" | "system"

export interface NavContextValue {
  workspaceId: Id<"workspaces"> | null
  workspace: Doc<"workspaces"> | null
  menuSet: Doc<"workspaceShell_menuSets"> | null
  menuSetId: Id<"workspaceShell_menuSets"> | null
  source: NavContextSource
  loading: boolean

  availableMenuSets: {
    user: Doc<"workspaceShell_menuSets">[]
    workspace: Doc<"workspaceShell_menuSets">[]
    system: Doc<"workspaceShell_menuSets">[]
  }

  effectiveMenuItems: Doc<"workspaceShell_menuItems">[]

  setMenuSet: (
    menuSetId: Id<"workspaceShell_menuSets"> | null,
  ) => Promise<void>
  forkMenuSet: (
    sourceMenuSetId: Id<"workspaceShell_menuSets">,
    name: string,
  ) => Promise<Id<"workspaceShell_menuSets">>
}

const EMPTY_AVAILABLE = {
  user: [] as Doc<"workspaceShell_menuSets">[],
  workspace: [] as Doc<"workspaceShell_menuSets">[],
  system: [] as Doc<"workspaceShell_menuSets">[],
}

/**
 * useNavContext — atomic (workspace × menuSet) navigation context.
 *
 * Resolves current user's effective menuSet via backend chain:
 *   user navContext cache > user assignment > workspace default > system
 *
 * Provides setter (atomic Convex mutation) + fork helper. Read-side is
 * subscribed via convex/react so updates flow live across tabs/windows.
 *
 * Returns null-shape when workspaceId is missing (caller must guard).
 */
export function useNavContext(
  workspaceId: Id<"workspaces"> | null | undefined,
): NavContextValue {
  const args = workspaceId ? { workspaceId } : ("skip" as const)

  const ctx = useQuery((api as any).features.workspaceShell.queries.getNavContext, args) as
    | {
        workspace: Doc<"workspaces"> | null
        menuSet: Doc<"workspaceShell_menuSets"> | null
        menuSetId: Id<"workspaceShell_menuSets"> | null
        source: NavContextSource
        userId: Id<"users">
      }
    | undefined

  const available = useQuery(
    (api as any).features.workspaceShell.queries.listAvailableMenuSets,
    args,
  ) as
    | {
        user: Doc<"workspaceShell_menuSets">[]
        workspace: Doc<"workspaceShell_menuSets">[]
        system: Doc<"workspaceShell_menuSets">[]
      }
    | undefined

  const effective = useQuery(
    (api as any).features.workspaceShell.queries.getEffectiveMenuItems,
    args,
  ) as
    | {
        items: Doc<"workspaceShell_menuItems">[]
        menuSetId: Id<"workspaceShell_menuSets"> | null
      }
    | undefined

  const setNavContextMutation = useMutation(
    (api as any).features.workspaceShell.mutations.setNavContext,
  )
  const forkMenuSetMutation = useMutation(
    (api as any).features.workspaceShell.mutations.forkMenuSet,
  )

  const setMenuSet = useCallback(
    async (menuSetId: Id<"workspaceShell_menuSets"> | null) => {
      if (!workspaceId) throw new Error("workspaceId required to set menuSet")
      await setNavContextMutation({
        workspaceId,
        menuSetId: menuSetId ?? undefined,
      })
    },
    [setNavContextMutation, workspaceId],
  )

  const forkMenuSet = useCallback(
    async (sourceMenuSetId: Id<"workspaceShell_menuSets">, name: string) => {
      if (!workspaceId) throw new Error("workspaceId required to fork menuSet")
      const id = (await forkMenuSetMutation({
        sourceMenuSetId,
        workspaceId,
        name,
      })) as Id<"workspaceShell_menuSets">
      return id
    },
    [forkMenuSetMutation, workspaceId],
  )

  return useMemo<NavContextValue>(
    () => ({
      workspaceId: workspaceId ?? null,
      workspace: ctx?.workspace ?? null,
      menuSet: ctx?.menuSet ?? null,
      menuSetId: ctx?.menuSetId ?? null,
      source: ctx?.source ?? "system",
      loading: workspaceId ? ctx === undefined : false,
      availableMenuSets: available ?? EMPTY_AVAILABLE,
      effectiveMenuItems: effective?.items ?? [],
      setMenuSet,
      forkMenuSet,
    }),
    [workspaceId, ctx, available, effective, setMenuSet, forkMenuSet],
  )
}
