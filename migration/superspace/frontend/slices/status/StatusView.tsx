import { useState } from "react";
import { StatusListView } from "./StatusListView";
import { StatusDetailView } from "./StatusDetailView";
import { FeatureThreeColumnLayout } from "@/frontend/shared/ui/layout/container/three-column";

export function StatusView() {
  const [selectedStatusId, setSelectedStatusId] = useState<string>();

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex-1 min-h-0">
        <FeatureThreeColumnLayout
          preset="feature"
          storageKey="status-layout"
          persistState={true}
          leftLabel="Status Updates"
          centerLabel={selectedStatusId ? "Status Viewer" : "Status"}
          rightHidden
          sidebarContent={
            <StatusListView
              selectedStatusId={selectedStatusId}
              onStatusSelect={setSelectedStatusId}
              variant="layout"
            />
          }
          mainContent={<StatusDetailView statusId={selectedStatusId} />}
        />
      </div>
    </div>
  );
}
