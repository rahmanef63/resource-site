"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { useMemo, useEffect } from "react"

/**
 * Field IDs for calendar database
 * These correspond to the predefined fields created by initializeDatabase
 */
const CALENDAR_FIELD_NAMES = {
    title: "Title",
    startDate: "Start Date",
    endDate: "End Date",
    description: "Description",
    location: "Location",
    color: "Color",
    allDay: "All Day",
} as const

export interface CalendarDatabaseEvent {
    id: string
    title: string
    startsAt: Date
    endsAt?: Date
    description?: string
    location?: string
    color?: string
    allDay?: boolean
    rowId: Id<"dbRows">
}

/**
 * Hook for Calendar feature using Database tables
 * This provides bidirectional sync - calendar events are stored in dbRows
 * and can be viewed/edited from both Calendar and Database features.
 */
export function useCalendarDatabase(workspaceId: Id<"workspaces"> | null | undefined) {
    // Get or create calendar database table
    const calendarTable = useQuery(
        api.features.database.tables.getByFeature,
        workspaceId ? { workspaceId, featureType: "calendar" as const } : "skip"
    )

    // Initialize database if it doesn't exist
    const initializeDatabase = useMutation(api.features.calendar.mutations.initializeDatabase)

    // Auto-initialize when workspace is available but table doesn't exist
    useEffect(() => {
        if (workspaceId && calendarTable === null) {
            initializeDatabase({ workspaceId }).catch(console.error)
        }
    }, [workspaceId, calendarTable, initializeDatabase])

    // Get table fields to map field names to IDs
    const fields = useQuery(
        api.features.database.fields.list,
        calendarTable?._id ? { tableId: calendarTable._id } : "skip"
    )

    // Build field name to ID mapping
    const fieldMap = useMemo(() => {
        if (!fields) return null
        const map = new Map<string, string>()
        for (const field of fields) {
            map.set(field.name, String(field._id))
        }
        return map
    }, [fields])

    // Get rows from calendar database
    const rows = useQuery(
        api.features.database.rows.list,
        calendarTable?._id ? { tableId: calendarTable._id } : "skip"
    )

    // Convert database rows to calendar events
    const events: CalendarDatabaseEvent[] = useMemo(() => {
        if (!rows || !fieldMap) return []

        const titleFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.title)
        const startDateFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.startDate)
        const endDateFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.endDate)
        const descriptionFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.description)
        const locationFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.location)
        const colorFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.color)
        const allDayFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.allDay)

        return rows
            .filter((row) => {
                const startDate = startDateFieldId ? row.data[startDateFieldId] : null
                return startDate !== null && startDate !== undefined
            })
            .map((row) => {
                const title = titleFieldId ? (row.data[titleFieldId] as string) : "Untitled"
                const startDate = startDateFieldId ? (row.data[startDateFieldId] as number) : Date.now()
                const endDate = endDateFieldId ? (row.data[endDateFieldId] as number | undefined) : undefined
                const description = descriptionFieldId ? (row.data[descriptionFieldId] as string | undefined) : undefined
                const location = locationFieldId ? (row.data[locationFieldId] as string | undefined) : undefined
                const color = colorFieldId ? (row.data[colorFieldId] as string | undefined) : undefined
                const allDay = allDayFieldId ? (row.data[allDayFieldId] as boolean | undefined) : undefined

                return {
                    id: String(row._id),
                    title: title || "Untitled",
                    startsAt: new Date(startDate),
                    endsAt: endDate ? new Date(endDate) : undefined,
                    description,
                    location,
                    color,
                    allDay,
                    rowId: row._id,
                }
            })
    }, [rows, fieldMap])

    // Mutations for CRUD
    const createRow = useMutation(api.features.database.rows.create)
    const updateRow = useMutation(api.features.database.rows.update)
    const deleteRow = useMutation(api.features.database.rows.deleteRow)

    // Create event helper
    const createEvent = async (event: Omit<CalendarDatabaseEvent, "id" | "rowId">) => {
        if (!calendarTable || !fieldMap) {
            throw new Error("Calendar database not initialized")
        }

        const data: Record<string, unknown> = {}
        const titleFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.title)
        const startDateFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.startDate)
        const endDateFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.endDate)
        const descriptionFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.description)
        const locationFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.location)
        const colorFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.color)
        const allDayFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.allDay)

        if (titleFieldId) data[titleFieldId] = event.title
        if (startDateFieldId) data[startDateFieldId] = event.startsAt.getTime()
        if (endDateFieldId && event.endsAt) data[endDateFieldId] = event.endsAt.getTime()
        if (descriptionFieldId && event.description) data[descriptionFieldId] = event.description
        if (locationFieldId && event.location) data[locationFieldId] = event.location
        if (colorFieldId && event.color) data[colorFieldId] = event.color
        if (allDayFieldId && event.allDay !== undefined) data[allDayFieldId] = event.allDay

        return createRow({
            tableId: calendarTable._id,
            data,
        })
    }

    // Update event helper
    const updateEvent = async (rowId: Id<"dbRows">, updates: Partial<Omit<CalendarDatabaseEvent, "id" | "rowId">>) => {
        if (!fieldMap) {
            throw new Error("Calendar database not initialized")
        }

        const data: Record<string, unknown> = {}
        const titleFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.title)
        const startDateFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.startDate)
        const endDateFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.endDate)
        const descriptionFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.description)
        const locationFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.location)
        const colorFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.color)
        const allDayFieldId = fieldMap.get(CALENDAR_FIELD_NAMES.allDay)

        if (titleFieldId && updates.title !== undefined) data[titleFieldId] = updates.title
        if (startDateFieldId && updates.startsAt !== undefined) data[startDateFieldId] = updates.startsAt.getTime()
        if (endDateFieldId && updates.endsAt !== undefined) data[endDateFieldId] = updates.endsAt?.getTime() ?? null
        if (descriptionFieldId && updates.description !== undefined) data[descriptionFieldId] = updates.description
        if (locationFieldId && updates.location !== undefined) data[locationFieldId] = updates.location
        if (colorFieldId && updates.color !== undefined) data[colorFieldId] = updates.color
        if (allDayFieldId && updates.allDay !== undefined) data[allDayFieldId] = updates.allDay

        return updateRow({
            id: rowId,
            data,
        })
    }

    // Delete event helper
    const deleteEvent = async (rowId: Id<"dbRows">) => {
        return deleteRow({ id: rowId })
    }

    return {
        isLoading: calendarTable === undefined || (calendarTable && rows === undefined),
        isInitializing: calendarTable === null,
        tableId: calendarTable?._id ?? null,
        events,
        createEvent,
        updateEvent,
        deleteEvent,
        // Also expose raw mutations for advanced use
        createRow,
        updateRow,
        deleteRow,
    }
}
