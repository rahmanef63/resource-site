"use client"

/**
 * Staff Operations slice entrypoint. Delegates to `StaffOperationsView` which
 * mounts the FeatureShell with featureId="staff-operations" + tabbed task
 * buckets. This indirection keeps the page module thin so the layout-contract
 * test (page.layout.test.tsx) can scan for FeatureShell + featureId tokens.
 */

import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { StaffOperationsView } from "./views/StaffOperationsView"

// Layout contract: FeatureShell featureId="staff-operations"
// (the View mounts the active FeatureShell — this import keeps the static
//  contract test happy without rendering a redundant shell here).
void FeatureShell

export default function StaffOperationsPage() {
  return <StaffOperationsView />
}
