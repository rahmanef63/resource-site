"use client";

// @dod:skip-uiux013 reason="documents: loading/empty/error states surface in nested subcomponents (cards, lists, dialogs) — view file is a layout host, not a data terminal"

import type { Id } from "@convex/_generated/dataModel";
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell";
import DocumentsFeaturePage from "./view/page";

export interface DocumentsPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function DocumentsPage({ workspaceId }: DocumentsPageProps) {
  return (
    <FeatureShell featureId="documents" maxWidth="full">
      <DocumentsFeaturePage workspaceId={workspaceId ?? null} hideHeader />
    </FeatureShell>
  );
}
