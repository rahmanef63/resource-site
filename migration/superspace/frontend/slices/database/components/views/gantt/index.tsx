"use client";

import { useMemo } from "react";
import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttFeatureItem,
  GanttMarker,
  GanttToday,
  GanttCreateMarkerTrigger,
} from "@/components/kibo-ui/gantt";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EyeIcon, LinkIcon, TrashIcon } from "lucide-react";
import type {
  DatabaseFeature,
  DatabaseMarker,
  DatabaseStatus,
} from "../../../types";
import type { GanttFeature, GanttStatus } from "@/components/kibo-ui/gantt";

export interface DatabaseGanttViewProps {
  features: DatabaseFeature[];
  markers: DatabaseMarker[];
  onSelectFeature?: (id: DatabaseFeature["id"]) => void;
  onCopyLink?: (id: DatabaseFeature["id"]) => void;
  onRemoveFeature?: (id: DatabaseFeature["id"]) => void;
  onMoveFeature?: (
    id: DatabaseFeature["id"],
    startAt: Date,
    endAt: Date | null,
  ) => void | Promise<void>;
  onCreateMarker?: (date: Date) => void | Promise<void>;
}

const DEFAULT_STATUS: GanttStatus = {
  id: "backlog",
  name: "Backlog",
  color: "#0ea5e9",
};

const resolveStatus = (
  status: DatabaseStatus | null | undefined,
): GanttStatus => ({
  id: status?.id ?? DEFAULT_STATUS.id,
  name: status?.name ?? DEFAULT_STATUS.name,
  color: status?.color ?? DEFAULT_STATUS.color,
});

const resolveGroup = (
  feature: DatabaseFeature & Required<Pick<DatabaseFeature, "startAt" | "endAt">>,
) =>
  feature.group ??
  feature.product ??
  feature.initiative ??
  "General";

type TimelineItem = {
  feature: GanttFeature;
  owner: DatabaseFeature["owner"];
  originalId: DatabaseFeature["id"];
};

type GroupedTimeline = {
  group: string;
  items: TimelineItem[];
};

export function DatabaseGanttView({
  features,
  markers,
  onSelectFeature,
  onCopyLink,
  onRemoveFeature,
  onMoveFeature,
  onCreateMarker,
}: DatabaseGanttViewProps) {
  const grouped = useMemo<GroupedTimeline[]>(() => {
    const map = new Map<string, TimelineItem[]>();

    features.forEach((feature) => {
      if (!feature.startAt || !feature.endAt) {
        return;
      }

      const timelineFeature: TimelineItem = {
        feature: {
          id: String(feature.id),
          name: feature.name,
          startAt: feature.startAt,
          endAt: feature.endAt,
          status: resolveStatus(feature.status),
        },
        owner: feature.owner,
        originalId: feature.id,
      };

      const key = resolveGroup(
        feature as DatabaseFeature &
          Required<Pick<DatabaseFeature, "startAt" | "endAt">>,
      );
      const items = map.get(key) ?? [];
      items.push(timelineFeature);
      map.set(key, items);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, items]) => ({ group, items }));
  }, [features]);

  return (
    <GanttProvider className="rounded-none" range="monthly" zoom={100}>
      <GanttSidebar>
        {grouped.map((entry) => (
          <GanttSidebarGroup key={entry.group} name={entry.group}>
            {entry.items.map((item: TimelineItem) => {
              const timeline: GanttFeature = item.feature;
              return (
                <GanttSidebarItem
                  key={timeline.id}
                  feature={timeline}
                  onSelectItem={() => onSelectFeature?.(item.originalId)}
                />
              );
            })}
          </GanttSidebarGroup>
        ))}
      </GanttSidebar>
      <GanttTimeline>
        <GanttHeader />
        <GanttFeatureList>
          {grouped.map((entry) => (
            <GanttFeatureListGroup key={entry.group}>
              {entry.items.map((item: TimelineItem) => {
                const timeline: GanttFeature = item.feature;
                const owner = item.owner;
                const originalId = item.originalId;
                return (
                  <div className="flex" key={timeline.id}>
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <button
                          type="button"
                          onClick={() => onSelectFeature?.(originalId)}
                          className="flex-1 text-left"
                        >
                          <GanttFeatureItem
                            id={timeline.id}
                            name={timeline.name}
                            startAt={timeline.startAt}
                            endAt={timeline.endAt}
                            status={timeline.status}
                            onMove={
                              onMoveFeature
                                ? (_id, startDate, endDate) => {
                                    void onMoveFeature(
                                      originalId,
                                      startDate,
                                      endDate,
                                    );
                                  }
                              : undefined
                          }
                          >
                            <p className="flex-1 truncate text-xs">
                              {timeline.name}
                            </p>
                            {owner ? (
                              <Avatar className="h-4 w-4">
                                {owner.avatarUrl ? (
                                  <AvatarImage src={owner.avatarUrl} />
                              ) : null}
                              <AvatarFallback>
                                {owner.label?.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : null}
                        </GanttFeatureItem>
                      </button>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() => onSelectFeature?.(originalId)}
                        className="flex items-center gap-2"
                      >
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                        View item
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => onCopyLink?.(originalId)}
                        className="flex items-center gap-2"
                      >
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        Copy link
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => onRemoveFeature?.(originalId)}
                        className="flex items-center gap-2 text-destructive"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Remove from roadmap
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </div>
              );
              })}
            </GanttFeatureListGroup>
          ))}
        </GanttFeatureList>
        {markers.map((marker) => (
          <GanttMarker key={marker.id} {...marker} />
        ))}
        <GanttToday />
        <GanttCreateMarkerTrigger
          onCreateMarker={(date) => onCreateMarker?.(date)}
        />
      </GanttTimeline>
    </GanttProvider>
  );
}





