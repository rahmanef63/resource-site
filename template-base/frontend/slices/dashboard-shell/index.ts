/**
 * Dashboard Shell slice — facade over
 * `frontend/shared/ui/layout/dashboard/`.
 *
 * Responsive shell: desktop sidebar + topbar, mobile dock + sheet sidebar.
 * Use `ResponsiveDashboardShell` to auto-switch at the md breakpoint;
 * import the desktop/mobile variants directly for explicit control.
 */

export {
  DesktopDashboardShell,
  type DesktopDashboardShellMode,
  type DesktopDashboardShellProps,
} from "@/frontend/shared/ui/layout/dashboard/DesktopDashboardShell";
export { MobileDashboardShell } from "@/frontend/shared/ui/layout/dashboard/MobileDashboardShell";
export { ResponsiveDashboardShell } from "@/frontend/shared/ui/layout/dashboard/ResponsiveDashboardShell";
