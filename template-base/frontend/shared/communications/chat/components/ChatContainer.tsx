/**
 * Main chat container component
 * Uses shared layout container from frontend/shared/ui/layout/container
 * @module shared/chat/components/ChatContainer
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/frontend/shared/ui/layout/container";
import { ContainerHeader } from "@/frontend/shared/ui/layout/header";
import type { ChatRoomRef, ChatDataSource } from "../types/chat";
import type { UserMeta } from "../types/message";
import type { ChatConfig, ChatLayout } from "../types/config";
import type { ChatEvents } from "../types/events";
import { useChat } from "../hooks/useChat";
import { useChatScroll } from "../hooks/useChatScroll";
import { useChatPresence } from "../hooks/useChatPresence";
import { ChatHeader } from "./ChatHeader";
import { ChatSidebar } from "./ChatSidebar";
import { ChatThread } from "./ChatThread";
import { ChatInput } from "./ChatInput";

export type ChatContainerProps = {
  room: ChatRoomRef;
  dataSource: ChatDataSource;
  currentUser: UserMeta;
  config?: Partial<ChatConfig>;
  layout?: Partial<ChatLayout>;
  events?: ChatEvents;
  className?: string;
  /** Use shared ContainerHeader instead of ChatHeader */
  useSharedHeader?: boolean;
  /** Toolbar slot (for filters, actions, etc.) */
  toolbarSlot?: React.ReactNode;
  /** Children slot (for custom content) */
  children?: React.ReactNode;
};

/**
 * Main chat container - the "ultimate" component
 * Orchestrates all chat functionality based on config
 * Uses shared PageContainer for consistent layout
 */
export function ChatContainer({
  room,
  dataSource,
  currentUser,
  config: configPartial,
  layout: layoutPartial,
  events,
  className = "",
  useSharedHeader = false,
  toolbarSlot,
  children,
}: ChatContainerProps) {
  // Initialize chat state
  const chat = useChat({
    room,
    dataSource,
    currentUser,
    config: configPartial,
    events,
  });

  // Scroll management
  const scroll = useChatScroll({
    enabled: chat.config.autoScroll,
  });

  // Presence & typing
  const presence = useChatPresence({
    roomId: room.roomId,
    userId: currentUser.id,
    enabled: chat.config.typingIndicator,
  });

  const showSidebar = layoutPartial?.sidebar ?? false;
  const isReadOnly = chat.config.contextMode === "system";

  return (
    <PageContainer
      maxWidth="full"
      padding={false}
      fullHeight
      className={cn("flex flex-col", className)}
    >
      {/* Header - Use shared or custom */}
      {useSharedHeader ? (
        <ContainerHeader
          title={chat.roomMeta?.name || "Chat"}
          subtitle={
            chat.config.isGroup
              ? `${chat.participants.length} participants`
              : chat.participants[0]?.name
          }
          actions={
            <button onClick={chat.refresh} className="p-2 hover:bg-muted rounded">
              Refresh
            </button>
          }
        />
      ) : (
        <ChatHeader
          room={chat.roomMeta}
          participants={chat.participants}
          actions={layoutPartial?.headerActions || []}
          config={chat.config}
          onRefresh={chat.refresh}
        />
      )}

      {/* Toolbar slot */}
      {toolbarSlot && (
        <div className="border-b border-border bg-background/50">
          {toolbarSlot}
        </div>
      )}

      {/* Custom children */}
      {children}

      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <ChatThread
            messages={chat.messages}
            currentUser={currentUser}
            roomMeta={chat.roomMeta}
            config={chat.config}
            scrollRef={scroll.scrollRef}
            onEdit={chat.editMessage}
            onDelete={chat.deleteMessage}
            onPin={chat.pinMessage}
            onReact={chat.reactToMessage}
            onLoadMore={chat.loadMore}
            hasMore={chat.hasMore}
            isLoading={chat.isLoading}
            typingUsers={presence.typingUsers}
          />

          {/* Input (hidden for read-only contexts) */}
          {!isReadOnly && (
            <ChatInput
              roomId={room.roomId}
              currentUser={currentUser}
              config={chat.config}
              accessories={layoutPartial?.inputAccessories || []}
              onSend={chat.sendMessage}
              onTyping={presence.setTyping}
              onUpload={events?.onUpload}
            />
          )}
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <ChatSidebar
            room={chat.roomMeta}
            participants={chat.participants}
            presence={presence.presence}
            config={chat.config}
          />
        )}
      </div>

      {/* Error display */}
      {chat.error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm" role="alert">
          {chat.error.message}
        </div>
      )}
    </PageContainer>
  );
}
