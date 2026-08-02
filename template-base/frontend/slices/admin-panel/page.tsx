"use client";

import * as React from "react";
import { AdminShell } from "./components/AdminShell";
import { AccessGate } from "./components/AccessGate";

/**
 * Admin route entry. Wrap with AccessGate so denied users see fallback
 * instead of leaked menu structure.
 *
 *   <AdminPage workspaceId={workspaceId} tier="solo">
 *     {/_ active subroute content _/}
 *   </AdminPage>
 */
export function AdminPage({
  workspaceId,
  tier = "organization",
  activeId,
  children,
}: {
  workspaceId: string;
  tier?: "solo" | "influencer" | "organization";
  activeId?: string;
  children?: React.ReactNode;
}) {
  return (
    <AccessGate
      workspaceId={workspaceId}
      minLevel="delegated_admin"
      fallback={
        <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">
          Not authorized. Contact your workspace owner.
        </div>
      }
    >
      <AdminShell workspaceId={workspaceId} tier={tier} activeId={activeId}>
        {children}
      </AdminShell>
    </AccessGate>
  );
}

export default AdminPage;
