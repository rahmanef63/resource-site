"use client";

import type { Id } from "@convex/_generated/dataModel";
import { DatabaseFeatureView } from "./views";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { PageContainer } from "@/frontend/shared/ui/layout/container";

export interface DatabaseFeaturePageProps {
  workspaceId: Id<"workspaces"> | null;
}

export default function DatabaseFeaturePage({
  workspaceId,
}: DatabaseFeaturePageProps) {
  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-background p-4 shadow-sm">
            <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Select a workspace
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick a workspace from the primary sidebar to spin up databases,
              organise initiatives, and visualise your roadmap.
            </p>
          </div>
          <Button variant="outline" disabled>
            Choose workspace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageContainer maxWidth="full" padding={false} className="h-full">
      <DatabaseFeatureView workspaceId={workspaceId} />
    </PageContainer>
  );
}

