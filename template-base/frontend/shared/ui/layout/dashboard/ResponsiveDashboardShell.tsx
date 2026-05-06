"use client"

import dynamic from "next/dynamic"
import {
  DesktopDashboardShell,
  type DesktopDashboardShellProps,
} from "@/frontend/shared/ui/layout/dashboard/DesktopDashboardShell"
import { useIsMobile } from "@/hooks/use-mobile"

const MobileDashboardShell = dynamic(
  () => import("./MobileDashboardShell").then((m) => m.MobileDashboardShell),
  { ssr: false }
)

export function ResponsiveDashboardShell(props: DesktopDashboardShellProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MobileDashboardShell {...props} />
  }

  return <DesktopDashboardShell {...props} />
}
