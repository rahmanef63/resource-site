"use client";

import type { Id } from "@convex/_generated/dataModel";
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell";
import { KnowledgeViewTabs } from "./shared/components/KnowledgeViewTabs";

export interface KnowledgePageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function KnowledgePage({ workspaceId }: KnowledgePageProps) {
  return (
    <FeatureShell featureId="knowledge" maxWidth="full">
      <KnowledgeViewTabs workspaceId={workspaceId ?? null} />
    </FeatureShell>
  );
}
