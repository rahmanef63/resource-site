/**
 * Chat header component
 * 
 * NOTE: For consistency with other features, consider using:
 * - ContainerHeader from @/frontend/shared/ui/layout/header
 * - ChatContainer with useSharedHeader={true}
 * 
 * @module shared/chat/components/ChatHeader
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Search, Pin, UserPlus, RefreshCw, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RoomMeta } from "../types/chat";
import type { UserMeta } from "../types/message";
import type { ChatConfig } from "../types/config";
import { formatUserName } from "../util/formatMessage";

export type ChatHeaderProps = {
  room: RoomMeta | null;
  participants: UserMeta[];
  actions?: Array<"search" | "sort" | "filter" | "pin" | "invite">;
  config: ChatConfig;
  onRefresh?: () => void;
  onSearch?: (query: string) => void;
  onInvite?: () => void;
  className?: string;
};

/**
 * Chat header with room info and actions
 * Uses Tailwind classes consistent with shared UI components
 */
export function ChatHeader({
  room,
  participants,
  actions = [],
  config,
  onRefresh,
  onSearch,
  onInvite,
  className,
}: ChatHeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showSearch, setShowSearch] = React.useState(false);

  const handleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery("");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 border-b border-border bg-card",
      className
    )}>
      <div className="flex items-center gap-3 min-w-0">
        {/* Room avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={room?.avatarUrl} alt={room?.name} />
          <AvatarFallback>
            {room?.name ? room.name.charAt(0).toUpperCase() : <MessageCircle className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>

        {/* Room name & metadata */}
        <div className="min-w-0">
          <h2 className="font-semibold truncate">{room?.name || "Loading..."}</h2>
          <div className="text-sm text-muted-foreground">
            {config.isGroup && (
              <span>
                {participants.length} participant{participants.length !== 1 ? "s" : ""}
              </span>
            )}
            {!config.isGroup && participants.length > 0 && (
              <span>{formatUserName(participants[0])}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Search */}
        {actions.includes("search") && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSearch}
              aria-label="Search messages"
              className="h-8 w-8"
            >
              <Search className="h-4 w-4" />
            </Button>
            {showSearch && (
              <form onSubmit={handleSearchSubmit} className="ml-2">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="h-8 w-48"
                  autoFocus
                />
              </form>
            )}
          </>
        )}

        {/* Pin */}
        {actions.includes("pin") && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Pinned messages"
            className="h-8 w-8"
          >
            <Pin className="h-4 w-4" />
          </Button>
        )}

        {/* Invite */}
        {actions.includes("invite") && config.allowInviteLink && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onInvite}
            aria-label="Invite users"
            className="h-8 w-8"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        )}

        {/* Refresh */}
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            aria-label="Refresh"
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
