"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MOCK_ANALYTICS, type AnalyticsData } from "../../lib/mock"

/**
 * Analytics — gap section. First-party funnel + metric cards over an injected
 * dataset (default: mock). CSS bars, no charting dependency.
 */
export function AnalyticsDashboard({ data = MOCK_ANALYTICS }: { data?: AnalyticsData }) {
  const max = Math.max(1, ...data.funnel.map((f) => f.count))
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {data.metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">{m.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold tabular-nums">{m.value}</span>
              <Badge variant={m.delta >= 0 ? "secondary" : "destructive"} className="tabular-nums">
                {m.delta >= 0 ? "+" : ""}
                {m.delta}%
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Conversion funnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.funnel.map((f) => (
            <div key={f.step} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{f.step}</span>
                <span className="tabular-nums text-muted-foreground">{f.count.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(f.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
