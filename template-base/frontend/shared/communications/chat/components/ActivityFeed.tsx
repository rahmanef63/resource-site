/**
 * Activity feed component (read-only mode)
 * @module shared/chat/components/ActivityFeed
 */

import React from "react";
import Image from "next/image";
import type { Message } from "../types/message";
import { formatTimestamp } from "../util/formatMessage";

export type ActivityFeedProps = {
  activities: Message[];
  onActivityClick?: (activity: Message) => void;
};

/**
 * Read-only activity/notification feed
 */
export function ActivityFeed({ activities, onActivityClick }: ActivityFeedProps) {
  return (
    <div className="chat-activity-feed">
      {activities.length === 0 ? (
        <div className="chat-activity-feed-empty">
          <p>No recent activity</p>
        </div>
      ) : (
        <div className="chat-activity-feed-list">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`chat-activity-item ${
                activity.isSystem ? "system" : ""
              }`}
              onClick={() => onActivityClick?.(activity)}
            >
              {/* Icon or avatar */}
              <div className="chat-activity-icon">
                {activity.author.avatarUrl ? (
                  <Image
                    src={activity.author.avatarUrl}
                    alt={activity.author.name || "User"}
                    width={32}
                    height={32}
                    className="h-full w-full rounded-full object-cover"
                    sizes="32px"
                  />
                ) : (
                  <div className="chat-activity-icon-placeholder">
                    {activity.isSystem ? "🔔" : "👤"}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="chat-activity-content">
                <div className="chat-activity-text">
                  {activity.content.text || activity.content.markdown}
                </div>
                <div className="chat-activity-time">
                  {formatTimestamp(activity.createdAt, "relative")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
