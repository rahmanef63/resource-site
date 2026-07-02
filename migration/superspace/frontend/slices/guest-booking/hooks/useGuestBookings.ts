"use client"

import { useMutation, useQuery } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@convex/_generated/dataModel"

export type BookingStatus =
  | "pending"
  | "verified"
  | "checked-in"
  | "checked-out"
  | "cancelled"

export interface BookingRow {
  _id: Id<"bookings">
  _creationTime: number
  workspaceId: Id<"workspaces">
  bookingNumber: string
  guestName: string
  guestEmail: string
  guestPhone?: string
  checkInDate: string
  checkOutDate: string
  roomNumber?: string
  status: BookingStatus
  syariahVerified: boolean
  mahramRelation?: string
  totalAmount?: number
  currency?: string
  notes?: string
  createdAt: number
  updatedAt: number
}

/**
 * Thin wrapper around the Convex `guestBooking` API surface.
 * Returns the bookings list + mutation handles for consumption by views.
 */
export function useGuestBookings(
  workspaceId: Id<"workspaces"> | null | undefined,
  statusFilter?: BookingStatus,
) {
  const listQuery = useQuery(
    api.features.guestBooking.queries.listBookings,
    workspaceId ? { workspaceId, status: statusFilter } : "skip",
  )

  const createBooking = useMutation(api.features.guestBooking.mutations.createBooking)
  const updateBooking = useMutation(api.features.guestBooking.mutations.updateBooking)
  const verifyBooking = useMutation(api.features.guestBooking.mutations.verifyBooking)
  const cancelBooking = useMutation(api.features.guestBooking.mutations.cancelBooking)
  const checkInBooking = useMutation(api.features.guestBooking.mutations.checkInBooking)

  return {
    bookings: (listQuery ?? []) as BookingRow[],
    isLoading: workspaceId ? listQuery === undefined : false,
    createBooking,
    updateBooking,
    verifyBooking,
    cancelBooking,
    checkInBooking,
  }
}
