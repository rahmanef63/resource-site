/**
 * Support Page
 */

"use client";

// @dod:skip-uiux013 reason="support: error state surfaces in SupportDashboard child via TicketList alerts + form toasts"

import type { Id } from "@/convex/_generated/dataModel";
import { SupportDashboard } from "./components/SupportDashboard";
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell";

interface SupportPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function SupportPage({ workspaceId }: SupportPageProps) {
  return (
    <FeatureShell featureId="support" padding={false}>
      <SupportDashboard workspaceId={workspaceId ?? null} />
    </FeatureShell>
  );
}
