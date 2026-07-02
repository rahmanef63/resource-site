
import React, { useState, useMemo } from "react"
import { Calendar, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Id } from "@convex/_generated/dataModel"
import { useCalendar } from "../hooks/useCalendar"
import { EventFormDialog } from "../components/EventFormDialog"
import { EventDetailsDialog } from "../components/EventDetailsDialog"
import { EVENT_TYPES } from "../constants"
import { CalendarSidebar } from "../components/CalendarSidebar"
import type { CalendarViewMode } from "@/frontend/shared/ui/components/event-calendar/types"
// Shared Layout
import { FeatureThreeColumnLayout } from "@/frontend/shared/ui/layout/container/three-column/FeatureThreeColumnLayout"
// Refactored Panels
import { CalendarLeftPanel } from "../components/panels/CalendarLeftPanel"
import { CalendarCenterPanel } from "../components/panels/CalendarCenterPanel"

interface CalendarPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function CalendarPage({ workspaceId }: CalendarPageProps) {
  // State
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
  const [eventFormOpen, setEventFormOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(EVENT_TYPES.map(t => t.value))
  // Right panel collapse state (controlled externally for header-trigger pattern)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)

  // Hooks
  const { isLoading, events, createEvent, updateEvent, deleteEvent } = useCalendar(workspaceId)

  // Derived Logic
  const filteredEvents = useMemo(() => {
    return events.filter((e: any) => selectedTypes.includes(e.type || 'meeting'))
  }, [events, selectedTypes])

  const selectedDateEvents = useMemo(() => {
    if (!date) return []
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    return filteredEvents.filter((e: any) => e.startsAt >= startOfDay.getTime() && e.startsAt <= endOfDay.getTime())
  }, [date, filteredEvents])

  const datesWithEvents = useMemo(() => {
    return filteredEvents.map((e: any) => new Date(e.startsAt))
  }, [filteredEvents])

  // Handlers
  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) setCurrentMonth(newDate)
  }

  const handleEventClick = (event: any) => {
    setSelectedEvent(event)
    setDetailsOpen(true)
  }

  const handleCreateClick = (initialDate?: Date) => {
    setDate(initialDate || date);
    setSelectedEvent(null);
    setEventFormOpen(true)
  }

  const handleEditClick = (event: any) => {
    setSelectedEvent(event)
    setDetailsOpen(false)
    setEventFormOpen(true)
  }

  const handleDeleteClick = async (eventId: string) => {
    if (!workspaceId) return
    if (confirm("Are you sure you want to delete this event?")) {
      await deleteEvent({ id: eventId as Id<"calendar"> })
      // Hook handles optimism or refresh, just close dialog
      setDetailsOpen(false)
    }
  }

  const handleEventDrop = async (event: any, targetDate: Date) => {
    if (!workspaceId) return

    const oldStart = new Date(event.startsAt)
    let newStart = new Date(targetDate)

    // Preserve time from old start
    newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0)

    // If it ends on a different day, preserve duration
    const duration = event.endsAt ? (event.endsAt - event.startsAt) : (60 * 60 * 1000) // Default 1h if missing
    const newEnd = new Date(newStart.getTime() + duration)

    await updateEvent({
      id: event._id,
      patch: {
        startsAt: newStart.getTime(),
        endsAt: newEnd.getTime()
      }
    })
  }

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const handleSubmit = async (formData: any) => {
    if (!workspaceId) return
    setIsProcessing(true)
    try {
      const startDateTime = formData.allDay
        ? new Date(formData.startDate).setHours(0, 0, 0, 0)
        : new Date(`${formData.startDate}T${formData.startTime}`).getTime()

      const endTimeStr = formData.hasEndTime ? formData.endTime : formData.startTime;
      const endDateTime = formData.allDay
        ? new Date(formData.endDate).setHours(23, 59, 59, 999)
        : new Date(`${formData.endDate}T${endTimeStr}`).getTime()

      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        startsAt: startDateTime,
        endsAt: endDateTime,
        allDay: formData.allDay,
        location: formData.location || undefined,
        type: formData.type,
        color: formData.color,
      }

      if (selectedEvent) {
        await updateEvent({ id: selectedEvent._id, patch: payload })
      } else {
        await createEvent({ workspaceId, ...payload })
      }
      setEventFormOpen(false); setSelectedEvent(null)
    } catch (error) { console.error("Failed to save event:", error) }
    finally { setIsProcessing(false) }
  }

  if (!workspaceId) return <div className="p-8 text-center">Select workspace</div>

  return (
    <>
      <FeatureThreeColumnLayout
        rightHidden={false}
        // Left Panel
        sidebarTitle="Filters"
        sidebarContent={
          <CalendarLeftPanel
            date={date}
            setDate={handleDateSelect}
            datesWithEvents={datesWithEvents}
            selectedTypes={selectedTypes}
            handleTypeToggle={handleTypeToggle}
            events={events}
            onEventClick={handleEventClick}
            handleCreateClick={handleCreateClick}
          />
        }
        sidebarStats={`${events.length} events`}

        // Center Panel
        mainContent={
          <CalendarCenterPanel
            date={date}
            setDate={handleDateSelect}
            filteredEvents={filteredEvents}
            handleCreateClick={handleCreateClick}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            onEventDrop={handleEventDrop}
            onEventClick={handleEventClick}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        }

        // Center header with schedule panel trigger
        mainHeader={
          <div className="flex items-center justify-between px-4 py-2 border-b h-10 bg-muted/10">
            <span className="text-sm font-medium truncate">
              {date
                ? date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
                : "Calendar"}
            </span>
            <Button
              variant={!rightPanelCollapsed ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setRightPanelCollapsed(prev => !prev)}
            >
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              Schedule
            </Button>
          </div>
        }

        // Right Panel
        inspector={
          <div className="h-full flex flex-col">
            <CalendarSidebar
              events={date ? selectedDateEvents : filteredEvents}
              onEventClick={handleEventClick}
              title={date ? `Schedule: ${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}` : "All Upcoming"}
            />
          </div>
        }

        // Loading states - automatically shows skeletons while loading
        loading={{
          sidebar: isLoading,
          center: isLoading,
          right: false,
        }}

        // Empty states - automatically shown when no events
        sidebarEmptyState={
          events.length === 0 ? {
            icon: Calendar,
            title: "No events yet",
            description: "Create your first calendar event to get started",
            action: {
              label: "Create Event",
              onClick: () => handleCreateClick(),
            },
          } : undefined
        }

        centerEmptyState={
          !date && filteredEvents.length === 0 ? {
            icon: Calendar,
            title: "Select a date",
            description: "Choose a date from the calendar to view or create events",
          } : undefined
        }

        // Layout props
        storageKey="calendar-layout"
        rightCollapsed={rightPanelCollapsed}
        onRightCollapsedChange={setRightPanelCollapsed}
      />

      <EventFormDialog
        open={eventFormOpen}
        onOpenChange={setEventFormOpen}
        initialDate={date}
        event={selectedEvent}
        onSubmit={handleSubmit}
        isProcessing={isProcessing}
      />

      <EventDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        event={selectedEvent}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />
    </>
  )
}
