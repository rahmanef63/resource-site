"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { resolveAdminLabels, type SliceAdminLabels } from "./lib"

/**
 * Admin shell — generic CRUD landing scaffold. Consumer mounts feature panels
 * (users, content, audit log, etc.) into the children grid. Gated by
 * `requireAdmin` on convex side; route should be wrapped in an auth guard.
 *
 * v0.2.0 — labels hoisted as a prop via the portable `SliceAdminLabels`
 * surface. Defaults are intentionally generic; consumers override per-app.
 */
export default function AdminPage({
  labels,
}: {
  labels?: SliceAdminLabels
} = {}) {
  const l = resolveAdminLabels(labels)
  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{l.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{l.subtitle}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{l.emptyHeading}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {l.emptyBody}
        </CardContent>
      </Card>
    </div>
  )
}
