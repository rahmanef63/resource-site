"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { StatusListPresenter, type StatusUpdate } from "../components/StatusListPresenter"

const NOW_LABEL = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
const earlier = (mins: number) =>
  new Date(Date.now() - mins * 60_000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

const MOCK_STATUSES: StatusUpdate[] = [
  { id: "u_alif",  name: "Alif Pratama",   avatar: "", time: NOW_LABEL,   hasUpdate: true,  mediaType: "photo" },
  { id: "u_bella", name: "Bella Setiawan", avatar: "", time: earlier(15), hasUpdate: true,  mediaType: "video" },
  { id: "u_cahya", name: "Cahya Nugroho",  avatar: "", time: earlier(45), hasUpdate: false, mediaType: "photo" },
  { id: "u_dwi",   name: "Dwi Rahayu",     avatar: "", time: earlier(120),hasUpdate: false, mediaType: "photo" },
]

function StatusPreview({ compact }: FeaturePreviewProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | undefined>(MOCK_STATUSES[0].id)

  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Status</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_STATUSES.filter((s) => s.hasUpdate).length} new · {MOCK_STATUSES.length} updates
        </p>
      </div>
    )
  }

  return (
    <div className="grid h-full grid-cols-[320px_1fr] overflow-hidden">
      <StatusListPresenter
        statuses={MOCK_STATUSES}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatusId={selectedId}
        onStatusSelect={setSelectedId}
        variant="layout"
      />
      <div className="flex h-full flex-col items-center justify-center bg-muted/20 p-6 text-center text-muted-foreground">
        <p className="text-sm font-medium">Selected: {MOCK_STATUSES.find((s) => s.id === selectedId)?.name ?? "—"}</p>
        <p className="mt-1 text-xs">Status detail viewer renders the photo/video update here.</p>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "status",
  name: "Status",
  description: "Ephemeral status updates (24-hour photo/video stories) per workspace member.",
  component: StatusPreview,
  category: "social",
  tags: ["status", "stories", "updates", "social"],
  mockDataSets: [
    {
      id: "default",
      name: "Recent updates",
      description: "4 mock status updates rendered through real StatusListPresenter.",
      data: { statuses: MOCK_STATUSES },
    },
  ],
})
