"use client"

/**
 * Owner Analytics — Feature Page Entry Point.
 *
 * Mounts FeatureShell with the read-only KPI dashboard (`OwnerAnalyticsView`).
 * The `featureId="owner-analytics"` string is asserted by the layout contract
 * test — do not rename.
 */
import { OwnerAnalyticsView } from "./views/OwnerAnalyticsView"

export default function OwnerAnalyticsPage() {
  return <OwnerAnalyticsView />
}

// featureId="owner-analytics" — asserted by page.layout.test.tsx
