"use client"

import { AdminConsole } from "./components/AdminConsole"
import type { AdminAccess } from "./lib/sections"

/**
 * Demo route. Replace DEMO_ACCESS with your own `useAdminAccess()` result and
 * pass a `components` map to mount reuse sections (users, blog, settings, …)
 * from the peer slices you installed. The 5 owned sections work as-is.
 */
const DEMO_ACCESS: AdminAccess = {
  isLoading: false,
  level: "platform_admin",
  permissions: ["*"],
  email: "owner@demo.dev",
}

export default function AdminConsolePage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <AdminConsole access={DEMO_ACCESS} />
    </div>
  )
}
