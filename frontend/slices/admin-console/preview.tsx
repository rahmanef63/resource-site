"use client"
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import type { SlicePreviewModule } from "@/shared/preview/types"
import { AdminConsole } from "./components/AdminConsole"
import type { AdminAccess } from "./lib/sections"

const ACCESS: Record<string, AdminAccess> = {
  "platform-admin": { isLoading: false, level: "platform_admin", permissions: ["*"], email: "owner@demo.dev" },
  "content-owner": { isLoading: false, level: "delegated_admin", permissions: ["content.manage"], email: "editor@demo.dev" },
  denied: { isLoading: false, level: "denied", permissions: [], email: null },
}

const preview: SlicePreviewModule = {
  AdminConsole: ({ variant }) => {
    const access = ACCESS[variant.scenario ?? "platform-admin"] ?? ACCESS["platform-admin"]
    return (
      <div className="p-4">
        <div className="h-[420px] overflow-hidden rounded-lg border bg-background">
          <AdminConsole access={access} />
        </div>
      </div>
    )
  },
}

export default preview
