'use client'

import { defineFeaturePreview } from '@/frontend/shared/preview'

function OwnerAnalyticsPreview() {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">Owner Analytics</h3>
      <p className="text-muted-foreground text-sm">
        Revenue dashboards, channel mix, property expansion tracking.
      </p>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: 'owner-analytics',
  name: 'Owner Analytics',
  description: 'Strategic financial dashboards, channel mix, and asset expansion tracking for property owners',
  component: OwnerAnalyticsPreview,
  category: 'analytics',
  tags: ['hospitality', 'analytics', 'revenue', 'kpi'],
  mockDataSets: [
    { id: 'default', name: 'Sample', description: 'Sample owner metrics', data: {} },
  ],
})
