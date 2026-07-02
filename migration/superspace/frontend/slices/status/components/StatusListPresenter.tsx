"use client";

import * as React from "react";
import { Camera, Plus, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchBar } from "@/frontend/shared/ui";
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column";
import { getInitials } from "@/frontend/shared/communications";

export interface StatusUpdate {
  id: string;
  name: string;
  avatar: string;
  time: string;
  hasUpdate: boolean;
  mediaType: "photo" | "video";
}

export type StatusListVariant = "standalone" | "layout";

export interface StatusListPresenterProps {
  statuses: StatusUpdate[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatusId?: string;
  onStatusSelect?: (statusId: string) => void;
  variant?: StatusListVariant;
}

export function StatusListPresenter({
  statuses,
  searchQuery,
  onSearchChange,
  selectedStatusId,
  onStatusSelect,
  variant = "standalone",
}: StatusListPresenterProps) {
  const filteredStatuses = statuses.filter((status) =>
    status.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEmpty = statuses.length === 0 && !searchQuery;

  // Sticky header — title row, search, "My status" entry
  const header = (
    <div className="space-y-3 p-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Status updates</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          aria-label="Add status"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <SearchBar
        placeholder="Search status updates"
        value={searchQuery}
        onChange={onSearchChange}
      />
      <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-muted text-foreground text-xs">Me</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-foreground">My status</h3>
          <p className="text-xs text-muted-foreground truncate">Tap to add status update</p>
        </div>
        <Camera className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );

  // Scrollable items — recent-updates list
  const items = (
    <div className="p-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Recent updates
      </h2>
      <div className="space-y-0.5">
        {isEmpty ? (
          <div className="p-6 text-center">
            <div className="h-14 w-14 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <ImageIcon className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-medium text-foreground mb-1 text-sm">No status updates yet</h3>
            <p className="text-xs text-muted-foreground">
              Share photos and videos that disappear in 24 hours.
            </p>
          </div>
        ) : filteredStatuses.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No status updates found
          </div>
        ) : (
          filteredStatuses.map((status) => (
            <div
              key={status.id}
              className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                status.id === selectedStatusId ? "bg-accent" : "hover:bg-muted"
              }`}
              onClick={() => onStatusSelect?.(status.id)}
            >
              <Avatar className={`h-10 w-10 ${status.hasUpdate ? "ring-2 ring-primary" : ""}`}>
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(status.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-foreground truncate">{status.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{status.time}</p>
              </div>
              {status.mediaType === "video" && (
                <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Sticky footer — primary CTA only when empty / inviting first capture
  const footer = isEmpty ? (
    <div className="p-3">
      <Button size="sm" className="w-full gap-2">
        <Camera className="h-4 w-4" />
        Add Status
      </Button>
    </div>
  ) : null;

  // Standalone variant keeps the legacy fixed-width border (used outside
  // the three-column shell). Layout variant uses PanelSection so it
  // respects the shell's Trigger / Header / Items / Footer slot system.
  if (variant === "standalone") {
    return (
      <div className="flex h-full w-full flex-col border-r border-border bg-card lg:w-[320px]">
        {header}
        <ScrollArea className="flex-1">{items}</ScrollArea>
        {footer}
      </div>
    );
  }

  return (
    <PanelSection label="Status updates">
      <PanelSection.Header>{header}</PanelSection.Header>
      <PanelSection.Items>
        <ScrollArea className="h-full">{items}</ScrollArea>
      </PanelSection.Items>
      {footer && <PanelSection.Footer>{footer}</PanelSection.Footer>}
    </PanelSection>
  );
}
