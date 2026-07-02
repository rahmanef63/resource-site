"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider";
import type { Id } from "@/convex/_generated/dataModel";
import {
  StatusListPresenter,
  type StatusUpdate,
  type StatusListVariant,
} from "./components/StatusListPresenter";

const useStatusUpdates = () => {
  const { workspaceId } = useWorkspaceContext();

  const rawStatuses = useQuery(
    api.features.status.queries.getStatusesByUser,
    workspaceId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip"
  );

  const statuses: StatusUpdate[] = (rawStatuses ?? []).map((item: any) => ({
    id: item.userId,
    name: (item.user as { name?: string } | null)?.name ?? "User",
    avatar: (item.user as { image?: string } | null)?.image ?? "",
    time: item.latestStatus ? new Date(item.latestStatus.createdAt).toLocaleTimeString() : "",
    hasUpdate: item.hasUnviewed,
    mediaType: item.latestStatus?.type === "video" ? "video" : "photo",
  }));

  return { statuses, isLoading: workspaceId !== null && rawStatuses === undefined };
};

interface StatusListViewProps {
  selectedStatusId?: string;
  onStatusSelect?: (statusId: string) => void;
  variant?: StatusListVariant;
}

export function StatusListView({
  selectedStatusId,
  onStatusSelect,
  variant = "standalone",
}: StatusListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { statuses } = useStatusUpdates();

  return (
    <StatusListPresenter
      statuses={statuses}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      selectedStatusId={selectedStatusId}
      onStatusSelect={onStatusSelect}
      variant={variant}
    />
  );
}
