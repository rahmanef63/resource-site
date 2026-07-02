"use client"

import React, { useMemo } from "react"
import { Sparkles, GitCommitHorizontal, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getAllFeatures } from "@/frontend/shared/lib/features/registry"
import changelogData from "@/frontend/shared/data/changelog.generated.json"

// ---------------------------------------------------------------------------
// Committed changelog shape (see scripts/generate-changelog.mjs)
// ---------------------------------------------------------------------------
interface ChangelogItem {
  subject: string
  scope: string | null
  hash: string
  shortHash: string
  date: string
}
interface ChangelogGroup {
  type: string
  label: string
  items: ChangelogItem[]
}
interface Changelog {
  generatedAt: string
  buildRef: string
  groups: ChangelogGroup[]
}

const changelog: Changelog = changelogData

// Feature status.state → badge color (mirrors AnalyticsContent idiom)
const STATUS_COLORS: Record<string, string> = {
  stable: "bg-green-500/10 text-green-600 border-green-500/20",
  beta: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  development: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  experimental: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  deprecated: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * ChangelogContent — "What's New" section for Platform Admin.
 * Read-only: renders the committed git changelog JSON plus live feature versions
 * from the auto-discovery registry. No backend.
 */
export function ChangelogContent() {
  const features = useMemo(() => {
    return [...getAllFeatures()].sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            What&apos;s New
          </h2>
          <p className="text-sm text-muted-foreground">
            Build{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              {changelog.buildRef}
            </code>{" "}
            · generated {formatDateTime(changelog.generatedAt)}
          </p>
        </div>

        {/* Changelog groups */}
        {changelog.groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No changelog entries.</p>
        ) : (
          changelog.groups.map((group) => (
            <Card key={group.type}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GitCommitHorizontal className="h-4 w-4 text-muted-foreground" />
                  {group.label}
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {group.items.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div
                      key={item.hash}
                      className="flex items-start justify-between gap-2 py-1.5 border-b last:border-0"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        {item.scope && (
                          <Badge
                            variant="outline"
                            className="flex-shrink-0 text-xs text-muted-foreground"
                          >
                            {item.scope}
                          </Badge>
                        )}
                        <span className="text-sm min-w-0">{item.subject}</span>
                      </div>
                      <span className="flex-shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(item.date)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Live feature versions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Feature versions
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {features.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {features.map((f) => (
                <div
                  key={f.id}
                  className="flex items-start justify-between gap-2 py-1.5 border-b last:border-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{f.name}</span>
                      <span className="flex-shrink-0 text-xs text-muted-foreground font-mono">
                        v{f.technical.version}
                      </span>
                    </div>
                    {f.appStore?.whatsNew && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {f.appStore.whatsNew}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`flex-shrink-0 text-xs capitalize ${STATUS_COLORS[f.status.state] ?? ""}`}
                  >
                    {f.status.state}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
