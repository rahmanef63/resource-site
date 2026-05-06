"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { BuilderDashboard } from "../components/BuilderDashboard"
import type { BuilderData, BuilderProject, BuilderTemplate } from "../ui/types"

const NOW = Date.now()

const MOCK_PROJECTS: BuilderProject[] = [
  { id: "p_1", name: "Marketing landing page",      lastModified: NOW - 86_400_000 * 1, pageCount: 4,  status: "published", url: "/landing/marketing" },
  { id: "p_2", name: "Pricing — Q2 redesign",       lastModified: NOW - 86_400_000 * 3, pageCount: 2,  status: "draft" },
  { id: "p_3", name: "Customer success microsite",  lastModified: NOW - 86_400_000 * 14, pageCount: 7, status: "published", url: "/microsites/cs" },
  { id: "p_4", name: "Internal handbook",            lastModified: NOW - 86_400_000 * 21, pageCount: 12, status: "draft" },
]

const MOCK_TEMPLATES: BuilderTemplate[] = [
  { id: "t_landing",  name: "Landing page",       description: "Hero + features + CTA",          thumbnail: "", category: "Marketing" },
  { id: "t_blog",     name: "Blog post",          description: "Article layout with sidebar",    thumbnail: "", category: "Content" },
  { id: "t_pricing",  name: "Pricing table",      description: "3-tier pricing with toggle",     thumbnail: "", category: "Marketing" },
  { id: "t_dashboard",name: "Internal dashboard", description: "Stats grid + recent activity",   thumbnail: "", category: "Internal" },
]

const MOCK_DATA: BuilderData = {
  isLoading: false,
  projects: MOCK_PROJECTS,
  templates: MOCK_TEMPLATES,
}

function StudioPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Studio</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_PROJECTS.length} projects · {MOCK_TEMPLATES.length} templates
        </p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-4">
      <BuilderDashboard
        data={MOCK_DATA}
        onOpenProject={() => { /* preview: no-op */ }}
        onCreateProject={() => { /* preview: no-op */ }}
      />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "studio",
  name: "Studio",
  description: "Unified visual builder for pages, microsites, and workflow automation.",
  component: StudioPreview,
  category: "creativity",
  tags: ["builder", "automation", "visual", "canvas", "workflow"],
  mockDataSets: [
    {
      id: "default",
      name: "Builder dashboard",
      description: "4 projects (mix of published + draft) and 4 starter templates.",
      data: { projects: MOCK_PROJECTS, templates: MOCK_TEMPLATES },
    },
  ],
})
