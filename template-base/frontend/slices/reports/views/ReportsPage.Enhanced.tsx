"use client"

import type { Id } from "@convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { api as apiUntyped } from "@/frontend/shared/foundation/utils/convex/any-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileBarChart } from "lucide-react"
import { FeatureNotReady, FeatureBadge } from "@/frontend/shared/ui"

interface ReportsPageProps {
  workspaceId: Id<"workspaces">
}

export default function ReportsPage({ workspaceId }: ReportsPageProps) {
  // Check if this feature is fully implemented
  const menuItem = useQuery(apiUntyped["features/menus/menuItems"].getMenuItemBySlug, {
    workspaceId,
    slug: "reports",
  })

  const isReady = menuItem?.metadata?.isReady !== false
  const status = menuItem?.metadata?.status || "stable"
  const expectedRelease = menuItem?.metadata?.expectedRelease

  // If feature is not ready, show FeatureNotReady component
  if (!isReady) {
    return (
      <FeatureNotReady
        featureName="Reports"
        featureSlug="reports"
        status={status as any}
        expectedRelease={expectedRelease}
        message="The Reports feature is currently under development. Core functionality is being built."
        docsUrl="/docs/features/reports"
        onGoBack={() => window.history.back()}
      />
    )
  }

  const reports = useQuery(api.features.reports.queries.list, { workspaceId })

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
              {status && status !== "stable" && <FeatureBadge status={status as any} />}
            </div>
            <p className="text-muted-foreground">Analitik dan laporan workspace</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports === undefined ? (
          <div className="col-span-full flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center gap-4 p-8">
            <FileBarChart className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Belum ada laporan</p>
              <p className="text-sm text-muted-foreground">Buat laporan pertama Anda</p>
            </div>
          </div>
        ) : (
          reports.map((report) => (
            <Card key={report._id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileBarChart className="h-5 w-5" />
                  {report.name}
                </CardTitle>
                <CardDescription>
                  {new Date(report.createdAt).toLocaleDateString("id-ID")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Report details akan ditampilkan di sini</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
