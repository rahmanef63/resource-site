"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { CalendarSidebar } from "../components/CalendarSidebar"

const NOW = Date.now()
const HOUR = 3_600_000
const DAY = 86_400_000

const MOCK_EVENTS = [
  { _id: "ev_1", title: "Team standup",        startsAt: NOW + HOUR * 2,       endsAt: NOW + HOUR * 2 + 1_800_000, color: "blue",   type: "meeting", allDay: false, location: "Zoom" },
  { _id: "ev_2", title: "Client demo — Alif",   startsAt: NOW + HOUR * 5,       endsAt: NOW + HOUR * 6,             color: "green",  type: "meeting", allDay: false, location: "Office, Room 3" },
  { _id: "ev_3", title: "Q2 planning workshop", startsAt: NOW + DAY * 1,        endsAt: NOW + DAY * 1 + HOUR * 4,   color: "purple", type: "workshop",allDay: false },
  { _id: "ev_4", title: "Bella's birthday",      startsAt: NOW + DAY * 2,        endsAt: NOW + DAY * 2 + DAY,        color: "amber",  type: "personal",allDay: true },
  { _id: "ev_5", title: "1:1 with Cahya",       startsAt: NOW + DAY * 3 + HOUR, endsAt: NOW + DAY * 3 + HOUR * 2,   color: "blue",   type: "meeting", allDay: false },
  { _id: "ev_6", title: "Yesterday's retro",    startsAt: NOW - DAY,            endsAt: NOW - DAY + HOUR,           color: "slate",  type: "meeting", allDay: false },
]

function CalendarPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Calendar</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_EVENTS.filter((e) => e.startsAt >= NOW).length} upcoming events
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex items-center justify-center bg-muted/30 p-6">
        <div className="text-center text-muted-foreground">
          <p className="text-sm font-medium mb-1">Month / Week / Day grid</p>
          <p className="text-xs">Sidebar lists upcoming events from the same dataset →</p>
        </div>
      </div>
      <CalendarSidebar events={MOCK_EVENTS} onEventClick={() => { /* preview: no-op */ }} />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "calendar",
  name: "Calendar",
  description: "Schedule events, RSVP, sync, and overview the upcoming week.",
  component: CalendarPreview,
  category: "productivity",
  tags: ["calendar", "events", "schedule"],
  mockDataSets: [
    {
      id: "default",
      name: "Busy week",
      description: "Mix of meetings, all-day events, and a past retro.",
      data: { events: MOCK_EVENTS },
    },
  ],
})
