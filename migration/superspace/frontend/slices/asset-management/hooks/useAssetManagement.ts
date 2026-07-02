"use client"

import { useCallback, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "@/hooks/use-toast"
import type {
  AssetStatus,
  AssetSummary,
  ManagedAsset,
  ManagedAssetWithTransactions,
  RegisterAssetInput,
  RetireAssetInput,
  TransferAssetInput,
} from "../types"

interface UseAssetManagementOptions {
  status?: AssetStatus | "all"
  category?: string
}

/**
 * Asset Management hook.
 *
 * Surfaces the 4-status lifecycle (active / maintenance / retired / lost) and
 * 6 transaction types (purchase / transfer / maintenance / depreciation /
 * retirement / revaluation) against the `managedAssets` + `assetTransactions`
 * Convex domain.
 */
export function useAssetManagement(
  workspaceId: Id<"workspaces"> | null | undefined,
  options: UseAssetManagementOptions = {},
) {
  const { status, category } = options

  const listArgs = workspaceId
    ? {
        workspaceId,
        ...(status && status !== "all" ? { status } : {}),
        ...(category ? { category } : {}),
      }
    : "skip"

  const listQuery = useQuery(api.features.assetManagement.queries.listAssets, listArgs)

  const summaryQuery = useQuery(
    api.features.assetManagement.queries.getSummary,
    workspaceId ? { workspaceId } : "skip",
  )

  const registerMutation = useMutation(api.features.assetManagement.mutations.registerAsset)
  const transferMutation = useMutation(api.features.assetManagement.mutations.transferAsset)
  const retireMutation = useMutation(api.features.assetManagement.mutations.retireAsset)

  const items = useMemo<ManagedAsset[]>(
    () => ((listQuery ?? []) as ManagedAsset[]),
    [listQuery],
  )
  const summary = summaryQuery as AssetSummary | undefined

  const isLoading = workspaceId ? listQuery === undefined : false

  const registerAsset = useCallback(
    async (input: RegisterAssetInput) => {
      if (!workspaceId) throw new Error("No workspace selected")
      try {
        const result = await registerMutation({
          workspaceId,
          branchId: input.branchId || undefined,
          name: input.name,
          category: input.category,
          serialNumber: input.serialNumber || undefined,
          purchaseDate: input.purchaseDate || undefined,
          purchasePrice: input.purchasePrice,
          depreciationMethod: input.depreciationMethod,
          usefulLifeYears: input.usefulLifeYears,
          location: input.location || undefined,
          assignedTo: input.assignedTo
            ? (input.assignedTo as Id<"users">)
            : undefined,
          notes: input.notes || undefined,
          photos: input.photos,
        })
        toast({ title: "Asset registered", description: input.name })
        return result
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to register asset"
        toast({ title: "Register failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, registerMutation],
  )

  const transferAsset = useCallback(
    async (assetId: Id<"managedAssets">, input: TransferAssetInput) => {
      if (!workspaceId) return
      try {
        await transferMutation({
          workspaceId,
          assetId,
          toLocation: input.toLocation || undefined,
          toAssignee: input.toAssignee
            ? (input.toAssignee as Id<"users">)
            : undefined,
          notes: input.notes || undefined,
        })
        toast({ title: "Asset transferred" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to transfer asset"
        toast({ title: "Transfer failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, transferMutation],
  )

  const retireAsset = useCallback(
    async (assetId: Id<"managedAssets">, input: RetireAssetInput) => {
      if (!workspaceId) return
      try {
        await retireMutation({
          workspaceId,
          assetId,
          reason: input.reason,
        })
        toast({ title: "Asset retired" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to retire asset"
        toast({ title: "Retire failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, retireMutation],
  )

  return {
    items,
    summary,
    isLoading,
    registerAsset,
    transferAsset,
    retireAsset,
  }
}

/**
 * Per-asset getter — returns the asset plus its last 50 transactions
 * (descending by date). Used to power the inspector drawer without forcing
 * the main list query to include ledger data.
 */
export function useAssetDetail(
  workspaceId: Id<"workspaces"> | null | undefined,
  assetId: Id<"managedAssets"> | null | undefined,
) {
  const detailQuery = useQuery(
    api.features.assetManagement.queries.getAsset,
    workspaceId && assetId ? { workspaceId, assetId } : "skip",
  )
  return detailQuery as ManagedAssetWithTransactions | null | undefined
}

export type AssetAction = "transfer" | "retire"

/**
 * Legal state transitions for a managed asset. Consumed by the detail drawer
 * to show only the buttons the current status permits.
 */
export function availableActions(
  status: AssetStatus,
): Array<{ id: AssetAction; label: string }> {
  switch (status) {
    case "active":
    case "maintenance":
      return [
        { id: "transfer", label: "Transfer" },
        { id: "retire", label: "Retire" },
      ]
    case "retired":
    case "lost":
    default:
      return []
  }
}

export type { AssetStatus, AssetSummary, ManagedAsset, ManagedAssetWithTransactions }
