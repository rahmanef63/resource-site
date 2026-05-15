"use client"

import { useEffect, useMemo, useRef } from "react"
import { toast } from "sonner"
import { indonesianDocumentChecklist } from "../data/indonesianData"
import type { ChecklistItem } from "../types"

/**
 * Persisted row for one user's checklist — mirror of the
 * `document_checklist_items` table.
 */
export interface ChecklistDoc {
  id: string
  name: string
  category: string
  subcategory?: string
  required: boolean
  completed: boolean
  notes: string
  expiryDate?: string
}

export interface ChecklistRow {
  _id: string
  documents: ChecklistDoc[]
  progress: number
  type: string
  country?: string
}

/**
 * Seed-template row used by `seed`. One per local + international set —
 * loaded from the slice's `data/indonesianData.ts` by default.
 */
export interface SeedTemplateDoc {
  id: string
  name: string
  category: string
  subcategory?: string
  required: boolean
}

/**
 * Bindings — the portable slice cannot import `convex/react` directly
 * (kitab R3 rule). Consumer wires its own client + api and passes the
 * adapter in. See README for the reference snippet.
 */
export interface ChecklistBindings {
  /** Query — current user's checklist row. `undefined` = loading, `null` = not seeded yet. */
  current: ChecklistRow | null | undefined
  /** Mutation — first-time seed with the default template. */
  seed: (args: {
    type: string
    country?: string
    template: SeedTemplateDoc[]
  }) => Promise<unknown> | unknown
  /** Mutation — toggle one item's completed/notes/expiry. */
  updateStatus: (args: {
    documentId: string
    completed: boolean
    notes?: string
    expiryDate?: string
  }) => Promise<unknown> | unknown
}

export interface UseChecklistDataOpts {
  /** When false (e.g., signed-out), the hook short-circuits — no seed attempt. */
  enabled?: boolean
}

export function useChecklistData(
  bindings: ChecklistBindings,
  opts: UseChecklistDataOpts = {},
) {
  const { current, seed, updateStatus } = bindings
  const enabled = opts.enabled ?? true

  // Reset the guard if seed throws — otherwise a transient blip locks
  // the user out of seeding for the entire mount.
  const seedAttempted = useRef(false)
  useEffect(() => {
    if (!enabled) return
    if (current === undefined) return
    if (current !== null) return
    if (seedAttempted.current) return
    seedAttempted.current = true
    Promise.resolve(
      seed({
        type: "combined",
        template: indonesianDocumentChecklist.map((d) => ({
          id: d.id,
          name: d.title,
          category: d.category,
          subcategory: d.subcategory,
          required: d.required,
        })),
      }),
    ).catch(() => {
      seedAttempted.current = false
    })
  }, [current, seed, enabled])

  const items = useMemo<ChecklistItem[]>(() => {
    const serverById = new Map(
      (current?.documents ?? []).map((d) => [d.id, d]),
    )
    return indonesianDocumentChecklist.map((tpl) => {
      const sv = serverById.get(tpl.id)
      const base: ChecklistItem = {
        ...tpl,
        completed: false,
      }
      return sv
        ? {
            ...base,
            completed: sv.completed,
            notes: sv.notes || undefined,
            dueDate: sv.expiryDate,
          }
        : base
    })
  }, [current])

  const toggleItem = (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return
    Promise.resolve(
      updateStatus({
        documentId: itemId,
        completed: !item.completed,
      }),
    ).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan"
      toast.error(msg)
    })
  }

  const updateItem = (itemId: string, updates: Partial<ChecklistItem>) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return
    Promise.resolve(
      updateStatus({
        documentId: itemId,
        completed: updates.completed ?? item.completed,
        notes: updates.notes ?? item.notes ?? "",
        expiryDate: updates.dueDate ?? item.dueDate ?? "",
      }),
    ).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan"
      toast.error(msg)
    })
  }

  const getFilteredItems = (
    category: "local" | "international",
    filterCategory: string | null,
  ) => {
    return items.filter((item) => {
      if (item.category !== category) return false
      if (filterCategory && item.subcategory !== filterCategory) return false
      return true
    })
  }

  const getProgress = (category: "local" | "international") => {
    const categoryItems = items.filter((item) => item.category === category)
    const requiredItems = categoryItems.filter((item) => item.required)
    const completedRequired = requiredItems.filter((item) => item.completed)
    return {
      total: categoryItems.length,
      completed: categoryItems.filter((item) => item.completed).length,
      required: requiredItems.length,
      requiredCompleted: completedRequired.length,
      percentage:
        requiredItems.length > 0
          ? Math.round((completedRequired.length / requiredItems.length) * 100)
          : 0,
    }
  }

  const getSubcategories = (category: "local" | "international") => {
    const categoryItems = items.filter((item) => item.category === category)
    return [...new Set(categoryItems.map((item) => item.subcategory))]
  }

  return {
    items,
    toggleItem,
    updateItem,
    getFilteredItems,
    getProgress,
    getSubcategories,
  }
}

export type ChecklistProgress = ReturnType<
  ReturnType<typeof useChecklistData>["getProgress"]
>
