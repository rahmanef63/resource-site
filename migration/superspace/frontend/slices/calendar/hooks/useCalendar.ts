import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for Calendar feature
 * Uses calendar queries: list, get
 * Uses calendar mutations: create, update, remove
 */
export function useCalendar(workspaceId: Id<"workspaces"> | null | undefined) {
  const events = useQuery(
    api.features.calendar.queries.list,
    workspaceId ? { workspaceId } : "skip"
  )

  const createEvent = useMutation(api.features.calendar.mutations.create)
  const updateEvent = useMutation(api.features.calendar.mutations.update)
  const deleteEvent = useMutation(api.features.calendar.mutations.remove)

  return {
    isLoading: events === undefined && workspaceId !== null && workspaceId !== undefined,
    events: events ?? [],
    createEvent,
    updateEvent,
    deleteEvent,
  }
}

export function useCalendarRange(
  workspaceId: Id<"workspaces"> | null | undefined,
  startDate: number,
  endDate: number
) {
  const events = useQuery(
    api.features.calendar.queries.list,
    workspaceId ? { workspaceId, rangeStart: startDate, rangeEnd: endDate } : "skip"
  )

  return {
    isLoading: events === undefined && !!workspaceId,
    events: events ?? [],
  }
}
