/**
 * Chat sidebar component
 * @module shared/chat/components/ChatSidebar
 */

import React from "react";
import Image from "next/image";
import type { RoomMeta, PresenceInfo } from "../types/chat";
import type { UserMeta } from "../types/message";
import type { ChatConfig } from "../types/config";
import { formatUserName } from "../util/formatMessage";

export type ChatSidebarProps = {
  room: RoomMeta | null;
  participants: UserMeta[];
  presence: PresenceInfo[];
  config: ChatConfig;
  onUserClick?: (user: UserMeta) => void;
};

/**
 * Chat sidebar with participants and metadata
 */
export function ChatSidebar({
  room,
  participants,
  presence,
  config,
  onUserClick,
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = React.useState<"participants" | "media">(
    "participants"
  );

  const getPresenceStatus = (userId: string): PresenceInfo["status"] => {
    const userPresence = presence.find((p) => p.userId === userId);
    return userPresence?.status || "offline";
  };

  return (
    <div className="chat-sidebar">
      {/* Tabs */}
      <div className="chat-sidebar-tabs">
        <button
          className={`chat-sidebar-tab ${
            activeTab === "participants" ? "active" : ""
          }`}
          onClick={() => setActiveTab("participants")}
        >
          Participants ({participants.length})
        </button>
        {config.mediaGallery && (
          <button
            className={`chat-sidebar-tab ${
              activeTab === "media" ? "active" : ""
            }`}
            onClick={() => setActiveTab("media")}
          >
            Media
          </button>
        )}
      </div>

      {/* Content */}
      <div className="chat-sidebar-content">
        {activeTab === "participants" && (
          <div className="chat-sidebar-participants">
            {participants.map((user) => {
              const status = getPresenceStatus(user.id);
              return (
                <div
                  key={user.id}
                  className="chat-sidebar-participant"
                  onClick={() => onUserClick?.(user)}
                  role="button"
                  tabIndex={0}
                >
                  {/* Avatar */}
                  <div className="chat-sidebar-participant-avatar">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={formatUserName(user)}
                        width={32}
                        height={32}
                        className="h-full w-full rounded-full object-cover"
                        sizes="32px"
                      />
                    ) : (
                      <div className="chat-sidebar-participant-avatar-placeholder">
                        {formatUserName(user)[0]}
                      </div>
                    )}
                    {/* Presence indicator */}
                    <span
                      className={`chat-sidebar-participant-presence ${status}`}
                      aria-label={status}
                    />
                  </div>

                  {/* Name and role */}
                  <div className="chat-sidebar-participant-info">
                    <div className="chat-sidebar-participant-name">
                      {formatUserName(user)}
                    </div>
                    {room?.roles?.[user.id] && (
                      <div className="chat-sidebar-participant-role">
                        {room.roles[user.id]}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "media" && (
          <div className="chat-sidebar-media">
            {/* TODO: Implement media gallery */}
            <p className="chat-sidebar-empty">No media yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
