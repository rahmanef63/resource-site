"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

/**
 * Admin shell — generic CRUD landing scaffold. Consumer mounts feature panels
 * (users, content, audit log, etc.) into the children grid. Gated by
 * `requireAdmin` on convex side; route should be wrapped in an auth guard.
 */
export default function AdminPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Workspace management surface. Wire panels via slice composition.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>No panels mounted</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Consumer projects compose panels here. See `convex/features/admin/queries.ts`
          for the admin probe + counts API.
        </CardContent>
      </Card>
    </div>
  )
}
