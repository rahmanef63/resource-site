"use client"

import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { MOCK_SEO, type SeoPage } from "../../lib/mock"

const tone = (score: number) =>
  score >= 85 ? "text-emerald-600" : score >= 70 ? "text-amber-600" : "text-destructive"

/**
 * SEO Health — gap section. Per-page score + issue list over injected pages
 * (default: mock). The seo slice generates metadata; this scores + surfaces it.
 */
export function SeoHealthPanel({ pages = MOCK_SEO }: { pages?: SeoPage[] }) {
  const avg = pages.length ? Math.round(pages.reduce((s, p) => s + p.score, 0) / pages.length) : 0
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Site SEO score</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <span className={cn("text-3xl font-semibold tabular-nums", tone(avg))}>{avg}</span>
          <Progress value={avg} className="flex-1" />
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {pages.map((p) => (
          <Card key={p.path}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm">{p.title}</CardTitle>
                <p className="font-mono text-xs text-muted-foreground">{p.path}</p>
              </div>
              <span className={cn("text-lg font-semibold tabular-nums", tone(p.score))}>{p.score}</span>
            </CardHeader>
            <CardContent>
              {p.issues.length === 0 ? (
                <p className="flex items-center gap-1 text-sm text-emerald-600">
                  <CheckCircle2 className="size-4" /> No issues
                </p>
              ) : (
                <ul className="space-y-1">
                  {p.issues.map((issue) => (
                    <li key={issue} className="flex items-center gap-1 text-sm text-muted-foreground">
                      <AlertCircle className="size-3.5 text-amber-600" /> {issue}
                    </li>
                  ))}
                </ul>
              )}
              {p.issues.length > 0 && (
                <Badge variant="outline" className="mt-2">
                  {p.issues.length} issue{p.issues.length > 1 ? "s" : ""}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
