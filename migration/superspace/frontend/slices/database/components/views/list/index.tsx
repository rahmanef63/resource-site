"use client";

import {
  ListProvider,
  ListGroup,
  ListItems,
  ListItem,
  type DragEndEvent,
} from "@/components/kibo-ui/list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { DatabaseFeature, DatabaseStatus } from "../../../types";

export interface DatabaseListViewProps {
  features: DatabaseFeature[];
  statuses: DatabaseStatus[];
  onMove?: (featureId: DatabaseFeature["id"], status: DatabaseStatus) => void;
}

export function DatabaseListView({
  features,
  statuses,
  onMove,
}: DatabaseListViewProps) {
  const fallbackStatuses: DatabaseStatus[] = [
    {
      id: "backlog",
      name: "Backlog",
      color: "#0ea5e9",
    },
  ];

  const baseStatuses = statuses.length > 0 ? statuses : fallbackStatuses;

  const listColumns: Array<{ id: string; name: string; color: string; original: DatabaseStatus; }> = baseStatuses.map((status, index) => ({
    id: status.id,
    name: status.name,
    color: status.color ?? ["#0ea5e9", "#6366f1", "#f97316"][index % 3],
    original: status,
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    if (!onMove) return;
    const { active, over } = event;
    if (!over) return;
    const status = listColumns.find((item) => item.id === over.id)?.original;
    if (!status) return;
    onMove(active.id as DatabaseFeature["id"], status);
  };

  return (
    <ListProvider className="overflow-auto" onDragEnd={handleDragEnd}>
      {listColumns.map((column) => (
        <ListGroup id={column.id} key={column.id}>
          <div className="flex items-center gap-2 bg-foreground/5 p-3">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <p className="m-0 text-sm font-semibold">{column.name}</p>
          </div>
          <ListItems>
            {features
              .filter((feature) => {
                if (!feature.status) {
                  return column.id === listColumns[0].id;
                }
                return feature.status.id === column.id;
              })
              .map((feature, index) => (
                <ListItem
                  key={feature.id}
                  id={feature.id}
                  index={index}
                  name={feature.name}
                  parent={column.id}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{feature.name}</span>
                    {feature.owner ? (
                      <Avatar className="h-4 w-4">
                        {feature.owner.avatarUrl ? (
                          <AvatarImage src={feature.owner.avatarUrl} />
                        ) : null}
                        <AvatarFallback>
                          {feature.owner.label.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : null}
                  </div>
                </ListItem>
              ))}
          </ListItems>
        </ListGroup>
      ))}
    </ListProvider>
  );
}
