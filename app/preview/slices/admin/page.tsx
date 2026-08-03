"use client";

import * as React from "react";
import { DashboardShell } from "@/features/dashboard-shell";
import {
  ADMIN_CONSOLE_SECTIONS,
  AdminConsole,
  filterSections,
  sectionsToNav,
  type AdminAccess,
} from "@/features/admin";

/** Demo access — a real app passes its own useAdminAccess() result. */
const ACCESS: AdminAccess = {
  isLoading: false,
  level: "platform_admin",
  permissions: ["*"],
  email: "owner@demo.dev",
};

/**
 * The composed admin panel as it is meant to ship: the console's sections ARE
 * the dashboard's nav (one sidebar, one mobile dock) and the console renders
 * the active panel only (`nav={false}`) — no second rail beside the first.
 */
export default function Page() {
  const visible = React.useMemo(
    () => filterSections(ADMIN_CONSOLE_SECTIONS, ACCESS, "org"),
    [],
  );
  const [active, setActive] = React.useState(visible[0]?.id ?? "");
  const nav = React.useMemo(
    () => sectionsToNav(visible, setActive, { activeId: active }),
    [visible, active],
  );

  return (
    <div className="relative h-svh transform-gpu overflow-hidden">
      <DashboardShell
        brand={{ name: "Acme", caption: "Admin console" }}
        nav={nav}
        title={visible.find((s) => s.id === active)?.label ?? "Admin"}
      >
        <AdminConsole access={ACCESS} nav={false} activeId={active} onNavigate={setActive} />
      </DashboardShell>
    </div>
  );
}
