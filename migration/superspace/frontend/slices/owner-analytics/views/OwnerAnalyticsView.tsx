"use client"

import { useState } from "react"
import { FeatureShell, type ShellTabItem } from "@/frontend/shared/ui/layout/feature-shell"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { TrendingUp, BedDouble, LineChart } from "lucide-react"
import { useOwnerKpis } from "../hooks/useOwnerKpis"
import { RevenueCards } from "../components/RevenueCards"
import { OccupancyCards } from "../components/OccupancyCards"
import { TrendChart } from "../components/TrendChart"

/**
 * Owner Analytics — KPI dashboard view.
 *
 * READ-ONLY aggregator surface. Three tabs (Revenue / Occupancy / Trend),
 * each backed by a corresponding aggregator query in
 * `convex/features/ownerAnalytics/queries.ts`.
 */
export function OwnerAnalyticsView() {
  const { workspaceId } = useWorkspaceContext()
  const [activeTab, setActiveTab] = useState<string>("revenue")
  const { revenue, occupancy, trend } = useOwnerKpis(workspaceId)

  if (!workspaceId) {
    return (
      <FeatureShell featureId="owner-analytics" centered padding>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Owner Analytics
          </p>
        </div>
      </FeatureShell>
    )
  }

  const tabs: ShellTabItem[] = [
    {
      value: "revenue",
      label: "Revenue",
      icon: TrendingUp,
      content: <RevenueCards data={revenue} />,
    },
    {
      value: "occupancy",
      label: "Occupancy",
      icon: BedDouble,
      content: <OccupancyCards data={occupancy} />,
    },
    {
      value: "trend",
      label: "Trend",
      icon: LineChart,
      content: <TrendChart data={trend} />,
    },
  ]

  return (
    <FeatureShell
      featureId="owner-analytics"
      padding
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  )
}

export default OwnerAnalyticsView
